CREATE TABLE users (
    user_id serial PRIMARY KEY,
    user_name varchar(255) not null,
    email 
    uid varchar(255) not null
);

CREATE TABLE transactions (
  transaction_id serial PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  merchant_name varchar(255) not null,
  amount decimal not null,
  closing_balance decimal not null,
  tag_id INT REFERENCES tags(tag_id),
  type boolean not null,
  date date not null,
  description text not null,
  reference_number varchar(255) not null
);

CREATE TABLE tags (
    tag_id serial PRIMARY KEY,
    tag_name varchar(255),
    tag_type boolean not null
);
