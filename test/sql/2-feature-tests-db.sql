-- ALTER USER 'hackolade'@'%' REQUIRE SSL;

-- -- create db

-- CREATE DATABASE IF NOT EXISTS test
-- 	CHARACTER SET = 'cp1251'
-- 	COLLATE = 'cp1251_ukrainian_ci';

-- -- create function
-- CREATE FUNCTION IF NOT EXISTS `test`.`my_func` (dept TINYTEXT) RETURNS INT
-- 	SQL SECURITY INVOKER
-- 	COMMENT 'comment for my function'
-- 	RETURN
-- 	  (SELECT MAX(salary) FROM employees WHERE employees.dept = dept);

-- CREATE FUNCTION IF NOT EXISTS `test`.hello (s CHAR(20))
--     RETURNS CHAR(50) DETERMINISTIC
--     RETURN CONCAT('Hello, ',s,'!');

-- DELIMITER //
-- CREATE FUNCTION IF NOT EXISTS `test`.counter () RETURNS INT
--   BEGIN
--     UPDATE counter SET c = c + 1;
--     RETURN (SELECT c FROM counter LIMIT 1);
--   END //
-- DELIMITER ;

-- DELIMITER $$
-- CREATE DEFINER=`root`@`localhost` FUNCTION IF NOT EXISTS `test`.`bpl_get_product_by_code`(
-- par_product_code VARCHAR(10)
-- ) RETURNS VARBINARY(36)
--     DETERMINISTIC
-- BEGIN
-- 	DECLARE var_id_product VARBINARY(36);	
-- 	SELECT id_product INTO var_id_product
-- 	FROM bpl_product_types
-- 	WHERE `code_product` = par_product_code;
-- 	RETURN var_id_product;
--     END$$

-- DELIMITER ;

-- -- create procedure
-- DELIMITER //

-- -- CREATE OR REPLACE DEFINER=CURRENT_USER PROCEDURE `test`.simpleproc (OUT param1 INT, IN param2 INT, param3 VARCHAR(12))
-- -- LANGUAGE SQL
-- -- NOT DETERMINISTIC
-- -- CONTAINS SQL
-- -- SQL SECURITY INVOKER
-- -- COMMENT 'my comment '
-- --  BEGIN
-- --   SELECT COUNT(*) INTO param1 FROM t;
-- --  END;
-- -- //

-- CREATE PROCEDURE IF NOT EXISTS `test`.simpleproc2 (
--   OUT param1 CHAR(10) CHARACTER SET 'utf8' COLLATE 'utf8_bin'
-- )
--  BEGIN
--   SELECT CONCAT('a'),f1 INTO param1 FROM t;
--  END;
-- //

-- DELIMITER ;

-- GRANT ALL PRIVILEGES ON  test.* to 'hackolade' WITH GRANT OPTION;
-- GRANT ALL PRIVILEGES ON  data_types.* to 'hackolade' WITH GRANT OPTION;
-- GRANT ALL PRIVILEGES ON  `spatial`.* to 'hackolade' WITH GRANT OPTION;
-- GRANT ALL PRIVILEGES ON  json_data.* to 'hackolade' WITH GRANT OPTION;
-- GRANT ALL PRIVILEGES ON  constr.* to 'hackolade' WITH GRANT OPTION;

-- -- create simple tables with data
-- CREATE TABLE IF NOT EXISTS test.A (
-- 	`id` int primary key auto_increment,
-- 	`data` LONGTEXT CHECK (JSON_VALID(data))
-- );

-- CREATE TABLE IF NOT EXISTS test.B (
-- 	id int primary key auto_increment,
-- 	a_id int,
-- 	constraint `b_to_a` foreign key (a_id) references A (id)
-- );

-- CREATE VIEW IF NOT EXISTS test.vA AS
-- 	SELECT data FROM test.A;

-- INSERT INTO test.A (data) VALUES ('{ "num": 12 }');
-- INSERT INTO test.A (data) VALUES ('{ "bool": true }');

-- INSERT INTO test.B (a_id) VALUES (1);
-- INSERT INTO test.B (a_id) VALUES (1);
-- INSERT INTO test.B (a_id) VALUES (2);

-- -- create tables with options

-- create or replace table `test`.`myisam_table` (
-- 	`id` int primary key auto_increment
-- )
-- ENGINE = MyISAM,
-- AUTO_INCREMENT = 10,
-- AVG_ROW_LENGTH = 100,
-- ROW_FORMAT = FIXED,
-- CHARACTER SET = 'utf8',
-- CHECKSUM = 1,
-- COLLATE = 'utf8_swedish_ci',
-- COMMENT = 'myisam table',
-- CONNECTION = 'localhost',
-- DATA DIRECTORY = '/tmp',
-- DELAY_KEY_WRITE = 1,
-- INDEX DIRECTORY = '/tmp',
-- KEY_BLOCK_SIZE = 12,
-- MAX_ROWS = 100,
-- MIN_ROWS = 1,
-- PACK_KEYS = 1,
-- PASSWORD = 'pass', -- unused
-- WITH SYSTEM VERSIONING;

-- create or replace table `test`.`innodb_table` (
-- 	`id` int primary key auto_increment
-- )
-- ENGINE = InnoDB,
-- ENCRYPTED = NO,
-- ENCRYPTION_KEY_ID = 1,
-- PAGE_COMPRESSED = 1,
-- PAGE_COMPRESSION_LEVEL = 1,
-- STATS_AUTO_RECALC = 1,
-- STATS_PERSISTENT = 1,
-- STATS_SAMPLE_PAGES = 1,
-- WITH SYSTEM VERSIONING;

-- create or replace table `test`.`csv_table` (
-- 	`id` int not null
-- )
-- ENGINE = CSV,
-- IETF_QUOTES = YES,
-- WITH SYSTEM VERSIONING;

-- create sequence if not exists `test`.s1;

-- CREATE OR REPLACE TABLE `test`.merge1 (
--     a INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     message CHAR(20)) ENGINE=MyISAM;

-- CREATE OR REPLACE TABLE `test`.merge2 (
--     a INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     message CHAR(20)) ENGINE=MyISAM;

-- INSERT INTO `test`.merge1 (message) VALUES ('Testing'),('table'),('merge1');

-- INSERT INTO `test`.merge2 (message) VALUES ('Testing'),('table'),('merge2');

-- CREATE OR REPLACE TABLE `test`.merge_table (
--     a INT NOT NULL AUTO_INCREMENT,
--     message CHAR(20), INDEX(a))
--     ENGINE=MERGE UNION=(`test`.`merge1`,`test`.`merge2`) INSERT_METHOD=LAST;

-- CREATE OR REPLACE TABLE `test`.aria_table (
-- 	`id` int primary key auto_increment
-- )
-- ENGINE = Aria
-- PAGE_CHECKSUM = 1
-- TRANSACTIONAL = 1
-- ROW_FORMAT = PAGE
-- TABLE_CHECKSUM = 1;

-- -- create partitioning tables

-- CREATE OR REPLACE TABLE `test`.`partition_table_hash` (
-- 	a INT,
-- 	b CHAR(5),
-- 	c DATETIME
-- )
-- PARTITION BY HASH ( YEAR(c) )
-- PARTITIONS 2;

-- CREATE OR REPLACE TABLE `test`.`partition_table_range`
-- (
-- 	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
-- 	timestamp DATETIME NOT NULL,
-- 	user INT UNSIGNED,
-- 	ip BINARY(16) NOT NULL,
-- 	action VARCHAR(20) NOT NULL,
-- 	PRIMARY KEY (id, timestamp)
-- )
-- 	ENGINE = InnoDB
-- PARTITION BY RANGE (YEAR(timestamp))
-- (
-- 	PARTITION p0 VALUES LESS THAN (2013),
-- 	PARTITION p1 VALUES LESS THAN (2014),
-- 	PARTITION p2 VALUES LESS THAN (2015),
-- 	PARTITION p3 VALUES LESS THAN (2016)
-- );

-- CREATE OR REPLACE TABLE `test`.`partition_table_list` (
-- 	id INT,
-- 	part_key int primary key NOT NULL AUTO_INCREMENT
-- )
-- PARTITION BY LIST (part_key)
-- (
-- 	PARTITION a VALUES IN (1,2),
-- 	PARTITION b VALUES IN (3,4)
-- );

-- CREATE OR REPLACE TABLE `test`.`partition_table_system_time` (x INT) WITH SYSTEM VERSIONING
--   PARTITION BY SYSTEM_TIME LIMIT 50000 (
--     PARTITION p_hist HISTORY,
--     PARTITION p_cur CURRENT
--   );

-- CREATE OR REPLACE TABLE `test`.`partition_table_system_time_2` (x INT) WITH SYSTEM VERSIONING
--   PARTITION BY SYSTEM_TIME INTERVAL 1000 SECOND (
--     PARTITION p_hist HISTORY,
--     PARTITION p_cur CURRENT
--   );

-- CREATE OR REPLACE TABLE `test`.`partition_table_system_time_3` (x INT) WITH SYSTEM VERSIONING
--   PARTITION BY SYSTEM_TIME
--     SUBPARTITION BY KEY (x)
--     SUBPARTITIONS 4 (
--     PARTITION ph HISTORY,
--     PARTITION pc CURRENT
--   );

-- CREATE OR REPLACE TABLE `test`.`partition_with_subpartitions`
-- (
-- 	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
-- 	timestamp DATETIME NOT NULL,
-- 	user INT UNSIGNED,
-- 	ip BINARY(16) NOT NULL,
-- 	action VARCHAR(20) NOT NULL,
-- 	PRIMARY KEY (id, timestamp)
-- )
-- 	ENGINE = InnoDB
-- 	PARTITION BY RANGE (YEAR(timestamp))
-- 	SUBPARTITION BY HASH(YEAR(timestamp))
-- 	SUBPARTITIONS 1
-- 	(
-- 		PARTITION p0 VALUES LESS THAN (2013) (SUBPARTITION subpart1 COMMENT = 'subpartition 1'),
-- 		PARTITION p1 VALUES LESS THAN (2014) (SUBPARTITION subpart2 COMMENT = 'subpartition 2'),
-- 		PARTITION p2 VALUES LESS THAN (2015) (SUBPARTITION subpart3 COMMENT = 'subpartition 3'),
-- 		PARTITION p3 VALUES LESS THAN (2016) (SUBPARTITION subpart4 COMMENT = 'subpartition 4')
-- 	);

-- CREATE OR REPLACE TEMPORARY TABLE `test`.`temporary` (
-- 	id int primary key
-- );

-- CREATE TABLE IF NOT EXISTS `test`.`if_not_exists` (
-- 	id int primary key
-- );

-- CREATE TABLE IF NOT EXISTS `test`.`like_table1` LIKE `test`.`if_not_exists`;
-- CREATE TABLE IF NOT EXISTS `test`.`like_table2` (LIKE `test`.`if_not_exists`);

-- CREATE OR REPLACE TABLE `test`.`as_select_source` (
-- 	a int not null,
-- 	b char(10)
-- ) ENGINE=MyISAM;

-- CREATE OR REPLACE TABLE `test`.`as_select` (
-- 	a INT NOT NULL,
-- 	b CHAR(10)
-- ) ENGINE=MyISAM
-- 	AS SELECT 5 AS a, b FROM `test`.`as_select_source`;

-- CREATE OR REPLACE TABLE `test`.`as_select1` (
-- 	a INT NOT NULL,
-- 	b CHAR(10)
-- ) ENGINE=MyISAM
-- 	SELECT 5 AS a, b FROM `test`.`as_select_source`;

-- CREATE OR REPLACE TABLE `test`.`as_select2` (
-- 	a INT NOT NULL,
-- 	b CHAR(10)
-- ) ENGINE=MyISAM
-- 	IGNORE SELECT 5 AS a, b FROM `test`.`as_select_source`;

-- CREATE OR REPLACE TABLE `test`.`as_select3` (
-- 	a INT NOT NULL,
-- 	b CHAR(10)
-- ) ENGINE=MyISAM
-- 	REPLACE SELECT 5 AS a, b FROM `test`.`as_select_source`;

-- CREATE OR REPLACE DATABASE `data_types`;

-- CREATE OR REPLACE TABLE `data_types`.`numeric_types` (
-- 	`tinyInt` TINYINT(12) SIGNED PRIMARY KEY,
-- 	`uTinyInt` TINYINT(20) UNSIGNED NOT NULL INVISIBLE DEFAULT 2,
-- 	`zTinyInt` TINYINT ZEROFILL,
-- 	`boolean` BOOLEAN,
-- 	`bool` BOOL,
-- 	`smallInt` SMALLINT SIGNED,
-- 	`medInt` MEDIUMINT ZEROFILL,
-- 	`int` INT SIGNED,
-- 	`integer` INTEGER(15) ZEROFILL,
-- 	`int1` INT1,
-- 	`int2` INT2,
-- 	`int3` INT3,
-- 	`int4` INT4,
-- 	`int8` INT8,
-- 	`bigInt` BIGINT(32) SIGNED NOT NULL AUTO_INCREMENT UNIQUE,
-- 	`uBigInt` BIGINT(32) UNSIGNED NOT NULL,
-- 	`zBigInt` BIGINT(20) ZEROFILL NOT NULL,
-- 	`dec` DECIMAL(5, 5),
-- 	`flt` FLOAT(6, 5),
-- 	`dbl` DOUBLE,
-- 	`real` REAL NOT NULl,
-- 	`bit` BIT,
-- 	`bit32` BIT(24) INVISIBLE,
-- 	`bit64` BIT(64)
-- );

-- CREATE OR REPLACE TABLE `data_types`.`string_types` (
-- 	`ch` CHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
-- 	`vChar` VARCHAR(255) CHARSET ascii COLLATE ascii_general_ci,
-- 	`tinyText` TINYTEXT CHARACTER SET utf16 COLLATE utf16_polish_ci,
-- 	`text` TEXT  CHARACTER SET cp1251 COLLATE cp1251_ukrainian_ci,
-- 	`medText` MEDIUMTEXT,
-- 	`longText` LONGTEXT,
-- 	`json` JSON
-- );

-- create or replace table `data_types`.`blob_table` (
-- 	tinyblob_field TINYBLOB,
-- 	blob_field BLOB,
-- 	mediumblob_field MEDIUMBLOB,
-- 	longblob_field LONGBLOB,
-- 	binary_field BINARY(12),
-- 	varbinary_field VARBINARY(12)
-- );

-- create or replace table `data_types`.`datetime_table` (
-- 	date_field DATE,
-- 	datetime_field DATETIME(3),
-- 	ts_1 TIMESTAMP,
-- 	ts_2 TIMESTAMP(3),
-- 	time_field TIME(6),
-- 	yr YEAR(4)
-- );

-- create or replace table `data_types`.`target_specific` (
-- 	`inet6` INET6,
-- 	`enum` ENUM('apple','orange','pear') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
-- 	`set` SET('a','b','c')
-- );

-- INSERT INTO `data_types`.`target_specific` (`inet6`, `enum`, `set`) VALUES (0x20010DB8000000000000FF0000428329, 'apple', ('a,b'));
-- INSERT INTO `data_types`.`target_specific` (`inet6`, `enum`, `set`) VALUES (UNHEX('20010DB8000000000000FF0000428329'), 'orange', ('a,b'));
-- INSERT INTO `data_types`.`target_specific` (`inet6`, `enum`, `set`) VALUES ('::ffff:192.0.2.128', 'pear', ('a,b'));
-- INSERT INTO `data_types`.`target_specific` (`inet6`, `enum`, `set`) VALUES ('::192.0.2.128', 'apple', ('a,b'));

-- CREATE OR REPLACE TABLE `data_types`.`compressed` (
-- 	`vChar` VARCHAR(255) CHARSET ascii COLLATE ascii_general_ci COMPRESSED=zlib,
-- 	`tinyText` TINYTEXT CHARACTER SET utf16 COLLATE utf16_polish_ci COMPRESSED=zlib,
-- 	`text` TEXT  CHARACTER SET cp1251 COLLATE cp1251_ukrainian_ci COMPRESSED=zlib,
-- 	`medText` MEDIUMTEXT COMPRESSED=zlib,
-- 	`longText` LONGTEXT COMPRESSED=zlib,
-- 	tinyblob_field TINYBLOB COMPRESSED=zlib,
-- 	blob_field BLOB COMPRESSED=zlib,
-- 	mediumblob_field MEDIUMBLOB COMPRESSED=zlib,
-- 	longblob_field LONGBLOB COMPRESSED=zlib,
-- 	`nChar` NATIONAL VARCHAR(50)
-- );

-- create or replace database `spatial`;

-- CREATE TABLE `spatial`.gis_point  (g POINT);
-- INSERT INTO `spatial`.gis_point VALUES
--     (PointFromText('POINT(10 10)')),
--     (PointFromText('POINT(20 10)')),
--     (PointFromText('POINT(20 20)')),
--     (PointFromWKB(AsWKB(PointFromText('POINT(10 20)'))));

-- CREATE TABLE `spatial`.gis_line  (g LINESTRING);
-- INSERT INTO `spatial`.gis_line VALUES
--     (LineFromText('LINESTRING(0 0,0 10,10 0)')),
--     (LineStringFromText('LINESTRING(10 10,20 10,20 20,10 20,10 10)')),
--     (LineStringFromWKB(AsWKB(LineString(Point(10, 10), Point(40, 10)))));

-- CREATE TABLE `spatial`.gis_polygon   (g POLYGON);
-- INSERT INTO `spatial`.gis_polygon VALUES
--     (PolygonFromText('POLYGON((10 10,20 10,20 20,10 20,10 10))')),
--     (PolyFromText('POLYGON((0 0,50 0,50 50,0 50,0 0), (10 10,20 10,20 20,10 20,10 10))')),
--     (PolyFromWKB(AsWKB(Polygon(LineString(Point(0, 0), Point(30, 0), Point(30, 30), Point(0, 0))))));

-- CREATE TABLE `spatial`.gis_multi_point (g MULTIPOINT);
-- INSERT INTO `spatial`.gis_multi_point VALUES
--     (MultiPointFromText('MULTIPOINT(0 0,10 10,10 20,20 20)')),
--     (MPointFromText('MULTIPOINT(1 1,11 11,11 21,21 21)')),
--     (MPointFromWKB(AsWKB(MultiPoint(Point(3, 6), Point(4, 10)))));

-- CREATE TABLE `spatial`.gis_multi_line (g MULTILINESTRING);
-- INSERT INTO `spatial`.gis_multi_line VALUES
--     (MultiLineStringFromText('MULTILINESTRING((10 48,10 21,10 0),(16 0,16 23,16 48))')),
--     (MLineFromText('MULTILINESTRING((10 48,10 21,10 0))')),
--     (MLineFromWKB(AsWKB(MultiLineString(LineString(Point(1, 2), Point(3, 5)), LineString(Point(2, 5), Point(5, 8), Point(21, 7))))));

-- CREATE TABLE `spatial`.gis_multi_polygon  (g MULTIPOLYGON);
-- INSERT INTO `spatial`.gis_multi_polygon VALUES
--     (MultiPolygonFromText('MULTIPOLYGON(((28 26,28 0,84 0,84 42,28 26),(52 18,66 23,73 9,48 6,52 18)),((59 18,67 18,67 13,59 13,59 18)))')),
--     (MPolyFromText('MULTIPOLYGON(((28 26,28 0,84 0,84 42,28 26),(52 18,66 23,73 9,48 6,52 18)),((59 18,67 18,67 13,59 13,59 18)))')),
--     (MPolyFromWKB(AsWKB(MultiPolygon(Polygon(LineString(Point(0, 3), Point(3, 3), Point(3, 0), Point(0, 3)))))));

-- CREATE TABLE `spatial`.gis_geometrycollection  (g GEOMETRYCOLLECTION);
-- INSERT INTO `spatial`.gis_geometrycollection VALUES
--     (GeomCollFromText('GEOMETRYCOLLECTION(POINT(0 0), LINESTRING(0 0,10 10))')),
--     (GeometryFromWKB(AsWKB(GeometryCollection(Point(44, 6), LineString(Point(3, 6), Point(7, 9)))))),
--     (GeomFromText('GeometryCollection()')),
--     (GeomFromText('GeometryCollection EMPTY'));

-- CREATE TABLE `spatial`.gis_geometry (g GEOMETRY);
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_point;
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_line;
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_polygon;
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_multi_point;
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_multi_line;
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_multi_polygon;
-- INSERT into `spatial`.gis_geometry SELECT * FROM `spatial`.gis_geometrycollection;

-- create database if not exists json_data;

-- CREATE OR REPLACE TABLE json_data.json_table (
-- 	`id` int primary key auto_increment,
-- 	`text` LONGTEXT CHECK (JSON_VALID(text)),
-- 	`json` JSON
-- );

-- INSERT INTO json_data.json_table (`text`, `json`) VALUES ('{ "num": 12 }', '[{ "str": "str" }]');
-- INSERT INTO json_data.json_table (`text`, `json`) VALUES ('{ "bool": true }', '[{ "null": null }]');

-- create database if not exists constr;

-- CREATE OR REPLACE TABLE `constr`.`comp_pk1` (
--     pk1 int auto_increment not null,
-- 	pk2 int not null,
--     CONSTRAINT `constraint_name` PRIMARY KEY (pk1, pk2)
-- );

-- CREATE OR REPLACE TABLE `constr`.`comp_uniq` (
--     pk int auto_increment not null primary key,
-- 	uk1 int not null,
-- 	uk2 int not null,
-- 	CONSTRAINT `uk_constr` UNIQUE KEY(uk1, `uk2`)
-- );

-- CREATE OR REPLACE TABLE `constr`.`inline_uniq` (
--     pk int auto_increment not null primary key,
-- 	uk1 int not null unique,
-- 	uk2 int not null unique
-- );

-- CREATE OR REPLACE TABLE `constr`.`check_constr` (
-- 	a INT CHECK (a>2),
-- 	b INT CHECK (b>2),
-- 	CONSTRAINT a_greater CHECK (a>b)
-- );

-- CREATE OR REPLACE TABLE `constr`.`index_table` (
-- 	a int primary key,
-- 	key1 int,
-- 	key2 int,
-- 	idx_uniq1 int,
-- 	idx_uniq2 int,
-- 	idx_fulltext TEXT,
-- 	spat geometry not null,
-- 	KEY (key1, key2)
-- ) Engine=MyISAM;

-- CREATE OR REPLACE UNIQUE INDEX `index_uniq` ON `constr`.`index_table` (idx_uniq1 DESC, idx_uniq2 ASC) WAIT 2 COMMENT 'my uniq index' LOCK=SHARED;
-- CREATE OR REPLACE FULLTEXT INDEX `index_fulltext` ON `constr`.`index_table` (idx_fulltext) NOWAIT COMMENT 'my full text index' ALGORITHM=COPY;
-- CREATE OR REPLACE SPATIAL INDEX `index_spatial` ON `constr`.`index_table` (spat) COMMENT 'my spatial index';

-- CREATE OR REPLACE TABLE `constr`.`index_table1` (
-- 	btree_idx text
-- ) Engine=InnoDB;

-- create or replace index `btree-index` using btree on `constr`.`index_table1` (btree_idx);

-- CREATE OR REPLACE TABLE `constr`.`index_table2` (
-- 	hash_idx int
-- ) Engine=Memory;

-- create or replace index `hash-index` using hash on `constr`.`index_table2` (hash_idx);

-- create or replace table `constr`.`inline_idxs` (
-- 	field int,
-- 	field1 text,
-- 	field2 text,
-- 	field4 int,
-- 	FULLTEXT INDEX `myIndex1` (field1, field2) COMMENT 'test',
-- 	KEY `myIndex2` USING BTREE (field) COMMENT 'my btree inline index'
-- );
