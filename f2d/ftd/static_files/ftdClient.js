var client_username; 
var headcolor;
var bodycolor;
function login () {
    if ($("#login_username").val() === undefined) return; 
    if ($("#login_password").val() === undefined ) return; 
    $.ajax({ 
        method: "GET", 
		url: `/login/${$("#login_username").val()}/password/${$("#login_password").val()}`
	}).done(function(data){
        if (data.statlogin == "loggedIn") {
            client_username = $("#login_username").val();
            $("#spritecolorbody").val(data.data.bodycolor);
            $("#spritecolorhead").val(data.data.headcolor);
            $("#circlebody").css("background-color", data.data.bodycolor);
            $("#circlehead").css("background-color", data.data.headcolor);
            headcolor=data.data.headcolor;
            bodycolor=data.data.bodycolor;
            toMenu();

        }
        else if (data.statusCode == 401){
            $("#login_username").text(data.name);
            $("#login_err").val("");
            $("#login_err").html("<p>Invalid Username or Password</p>");
            $("#login_alert").show();

        }
        else if (data.statusCode == 500){
            $("#login_username").text(data.name);
            $("#login_err").val("");
            $("#login_err").html("<p>Server Error</p>");
            $("#login_alert").show();
        }
	});
    return; 
}

function register () {
    if (!$("#register_username").val()) return; 
    if (!$("#register_password").val()) return; 
    $.ajax({ 
        method: "POST", 
        data: {
            user: $("#register_username").val(),
            password: $("#register_password").val(),
        },
		url: "/register/"
	}).done(function(data){
        switch(data.regstat) {
            case 'taken_username':
                $("#register_username")[0].setCustomValidity('Username Taken');
                $("#register_err").val("");
                $("#register_err").html("<p>Username taken</p>");
                $("#register_alert").show();
                break;
            case 'success':
                $("#register_err").val("");
                $("#register_alert").hide();
                toLogin();
                break;
        }
	});
    return; 
}
function toLogin () {
    $("#ui_login").show();
    $("#ui_register").hide();
    $("#stage").hide();
    $("#ui_menu").hide();
    $("#ui_stats").hide();
    $("#ui_profile").hide();
    $("#ui_401").hide();
}

function toRegister () {
    $("#ui_register").show();
    $("#ui_login").hide();
    $("#ui_menu").hide();
}

function toMenu () {
    $("#ui_login").hide();
    $("#ui_register").hide();
    $("#title").hide();
    $("#ui_stats").hide();
    $("#ui_profile").hide();
    $("#ui_menu").show();
    menu_init();
}

function menu_init() {
    $("#PlayButton").on('click', function(){
        $("#ui_menu").hide();
        $("#stage").show();
        if (interval) clearInterval(interval);
            setupGame(); 
            startGame();
    });
    $("#StatsButton").on('click', toStats);
    $("#ProfileButton").on('click', toProfile);
}

function toStats(){
    $("#ui_menu").hide();
    $("#ui_stats").show();
    
    //requesting user stats from database
    $.ajax({
        method: "GET",
        url: `/menu/stats/login/${$("#login_username").val()}`,
    }).done(function(data){
            if (data.statusCode == 401){
                noAccess();
            }
            else if (data.statusCode == 500){
                $("#personalstats_err").val("");
                $("#personalstats_err").html("<p>Server Error</p>");
                $("#personalstats_alert").show();
            }
            else if (data.statusCode == 200){
                $("#personalboxstats").text(data.totalkills); 
            }

     });
     //finish requesting user's personal data


    //request top 10 leaderboard stats from database
    $.ajax({
        method: "GET",
        url: "/menu/stats/leaderboards",
    }).done(function(data){
        //redirect to no access view
        if (data.statusCode == 401){
            noAccess();
        }

        else if (data.statusCode == 200){
            //if any users are present in the database for stats, fill the page as much as possible
            for (let i=0; i < 10; i++){
                if (data.ln[i]){
                    $("#name"+i).text(data.ln[i].username); 
                    $("#score"+i).text(data.ln[i].Total_kills); 
                }
                else{
                    $("#name"+i).text("NO USER"); 
                    $("#score"+i).text("EMPTY");
                }
            }
        }
        //if no users can be found in the table for stats
        else if (data.statusCode == 404 || data.statusCode == 500){
            for (let i=0; i < 10; i++){
                $("#name"+i).text("NO USER"); 
                $("#score"+i).text("EMPTY");
            }
        }
    });
    //finish request leaderboard information
    $("#statstomenu").on('click', toMenu);
}

function toProfile(){
    $("#ui_menu").hide();
    $("#ui_stats").hide();
    $("#ui_profile").show();



    //setting default sprite color
    $("#circlebody").css("background-color", $("#spritecolorbody").val());
    $("#circlehead").css("background-color", $("#spritecolorhead").val());

    //if the user is updating password
    $("#profileUpdate").on('click', function(){
        if ($("#curr-password").val()==$("#login_password").val()){
            $("#profile_err").val("");
            $("#profile_alert").hide();
            $.ajax({
                method: "PUT",
                data: {
                    user: $("#login_username").val(),
                    password: $("#new-password").val(),
                },
                url: "/menu/Profile/changepass"
            }).done(function(data){
                if (data.statusCode == 200){
                    $("#login_password").val("");
                    $("#new-password").val("");
                    $("#curr-password").val("");
                    toLogin();
                }
                else if (data.statusCode == 500){
                    $("#profile_err").val("");
                    $("#profile_err").html("<p>Server Error</p>");
                    $("#profile_alert").show();
                }
            });
        }
        else{
            $("#profile_err").val("");
            $("#profile_err").html("<p>Invalid Username or Password</p>");
            $("#profile_alert").show();
        }
    });

    //applying color change
    $("#spritecolorbody").on('change', function(){  
        $("#circlebody").css("background-color", $("#spritecolorbody").val());

    });

    $("#spritecolorhead").on('change', function(){
        $("#circlehead").css("background-color", $("#spritecolorhead").val());
    });
   
    $("#colorUpdate").on('click', function(){
        $.ajax({
            method: "PUT",
                data: {
                    user: $("#login_username").val(),
                    headcolor: $("#spritecolorhead").val(),
                    bodycolor: $("#spritecolorbody").val()
                },
                url: "/menu/Profile/changecolor"

        }).done(function(data){
            if (data.statusCode == 500){
                $("#profile_err").val("");
                $("#profile_err").html("<p>Server Error</p>");
                $("#profile_alert").show();  
            }
            else if (data.statusCode == 200){
                console.log(headcolor, bodycolor)
                headcolor  = $("#spritecolorhead").val();
                bodycolor = $("#spritecolorbody").val(); 
                console.log(headcolor, bodycolor)
            }
        });
    });

    //if the user wants to delete their own account
    $("#profileDelete").on('click', function(){
        if ($("#curr-password").val()==$("#login_password").val()){
            $("#profile_err").val("");
            $("#profile_alert").hide();
            $.ajax({
                method: "PUT",
                data: {
                    user: $("#login_username").val(),
                    password: $("#new-password").val(),
                },
                url: "/menu/Profile/delete"
            }).done(function(data){
                if (data.statusCode == 500){
                    $("#profile_err").val("");
                    $("#profile_err").html("<p>Server Error</p>");
                    $("#profile_alert").show();  
                }
            });
        }
        else{
            $("#profile_err").val("");
            $("#profile_err").html("<p>Invalid Username or Password</p>");
            $("#profile_alert").show();
        }
    });
    $("#proftomenu").on('click', toMenu);
}

//if the statusCode recieved from an endpoint is 401
function noAccess(){

    $("#ui_login").hide();
    $("#ui_register").hide();
    $("#stage").hide();
    $("#ui_menu").hide();
    $("#ui_stats").hide();
    $("#ui_profile").hide();
    $("#title").hide();
    $("#ui_401").show();
}

function restart() {
    setupGame(); 
    startGame();
    $("#pauseGame").hide();
    $("#Game_Finished").hide();
}

function quitGame() {
    $("#stage").hide();
    $("#pauseGame").hide();
    $("#Game_Finished").hide();
    toMenu();
}

/**
 * This calls itself right at the begining once
 * to setup the scens 
 **/
$(() => {
    $("#loginForm").on('submit',function(e){ e.preventDefault();login(); });
    $("#loginSubmit").on('click',function(){login(); });
    $("#toRegister").on('click',function(){toRegister(); });
    //$("#toRegister").on('click',toRegister);
    $("#registerForm").on('submit',function(e){ e.preventDefault();register(); });
    $("#registerSubmit").on('click',function(){register(); });
    $("#toLogin").on('click',function(e){ e.preventDefault();toLogin(); });
    $('#restartGameButton').on('click', function() {restart()})
    $('#quitGameButton').on('click', function () { quitGame()})
    $('#restartGameButtonFinished').on('click', function() {restart()})
    $('#quitGameButtonFinished').on('click', function () { quitGame()})
    $('#unpauseButton').on('click', function () { 
        startGame();
        $("#pauseGame").hide();
    })
	$("#ui_login").show();
    $("#ui_register").hide();
    $("#stage").hide();
    $("#ui_menu").hide();
    $("#ui_stats").hide();
    $("#ui_profile").hide();
    $("#pauseGame").hide();
    $("#Game_Finished").hide();
    $("#ui_401").hide();
});
