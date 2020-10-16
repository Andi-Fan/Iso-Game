--- load with 
--- sqlite3 Accounts.db < schema.sql
CREATE TABLE Account (
	username VARCHAR(20) PRIMARY KEY,
	password VARCHAR(255) NOT NULL,
	headcolor VARCHAR(20),
	bodycolor VARCHAR(20)
);

CREATE TABLE stats (
	username VARCHAR(20),
	Total_kills INT,
	PRIMARY KEY (username), 
	FOREIGN KEY (username) REFERENCES Account(username) ON DELETE CASCADE
);





