"use strict";var Ue=Object.defineProperty;var m=(T,y)=>Ue(T,"name",{value:y,configurable:!0});var v=(T,y)=>()=>(y||T((y={exports:{}}).exports,y),y.exports);var te=v((He,ee)=>{"use strict";ee.exports={number:"NUMBER",string:"TEXT",date:"DATE",timestamp:"TIMESTAMP",binary:"BINARY",boolean:"BIT",document:"LONGTEXT",array:"LONGTEXT",objectId:"VARCHAR(24)",default:"CHAR"}});var ne=v((Xe,re)=>{"use strict";re.exports={TINYINT:{capacity:1},SMALLINT:{capacity:2},MEDIUMINT:{capacity:3},INT:{capacity:4},INTEGER:{capacity:4},BIGINT:{capacity:8},INT1:{capacity:1},INT2:{capacity:2},INT3:{capacity:3},INT4:{capacity:4},INT8:{capacity:8},FLOAT:{capacity:4,mode:"floating"},DOUBLE:{capacity:8,mode:"floating"},"DOUBLE PRECISION":{capacity:8,mode:"floating"},REAL:{capacity:8,mode:"floating"},DECIMAL:{capacity:16,mode:"decimal"},DEC:{capacity:16,mode:"decimal"},NUMERIC:{capacity:16,mode:"decimal"},FIXED:{capacity:16,mode:"decimal"},NUMBER:{capacity:16,mode:"decimal"},CHAR:{size:1},VARCHAR:{mode:"varying"},TINYTEXT:{size:255,mode:"text"},TEXT:{size:65535,mode:"text"},MEDIUMTEXT:{size:16777215,mode:"text"},LONGTEXT:{size:4294967295,mode:"text"},JSON:{size:4294967295,mode:"text"},BINARY:{mode:"binary"},"CHAR BYTE":{mode:"binary"},VARBINARY:{size:2147483649,mode:"binary"},TINYBLOB:{size:255,mode:"binary"},BLOB:{size:65535,mode:"binary"},MEDIUMBLOB:{size:16777215,mode:"binary"},LONGBLOB:{size:4294967295,mode:"binary"},BIT:{mode:"boolean"},DATE:{format:"YYYY-MM-DD"},TIME:{format:"hh:mm:ss.nnnnnn"},DATETIME:{format:"YYYY-MM-DD hh:mm:ss"},TIMESTAMP:{format:"YYYY-MM-DD hh:mm:ss"},YEAR:{format:"YYYY"},ENUM:{mode:"enum"},SET:{mode:"enum"},GEOMETRY:{format:"euclidian",mode:"geospatial"},POINT:{format:"euclidian",mode:"geospatial"},LINESTRING:{format:"euclidian",mode:"geospatial"},POLYGON:{format:"euclidian",mode:"geospatial"},MULTIPOINT:{format:"euclidian",mode:"geospatial"},MULTILINESTRING:{format:"euclidian",mode:"geospatial"},MULTIPOLYGON:{format:"euclidian",mode:"geospatial"},GEOMETRYCOLLECTION:{format:"euclidian",mode:"geospatial"}}});var se=v((qe,ie)=>{"use strict";ie.exports={createDatabase:"CREATE DATABASE${ifNotExist} `${name}`${dbOptions};\n",createTable:"CREATE ${temporary}TABLE ${ifNotExist}${name} (\n	${column_definitions}${keyConstraints}${checkConstraints}${foreignKeyConstraints}\n)${options}${partitions}${ignoreReplace}${selectStatement};\n",createLikeTable:"CREATE ${orReplace}${temporary}TABLE ${ifNotExist}${name} LIKE ${likeTableName};\n",columnDefinition:"`${name}` ${national}${type}${signed}${charset}${collate}${generatedDefaultValue}${primary_key}${unique_key}${default}${autoIncrement}${zeroFill}${not_null}${invisible}${compressed}${comment}",checkConstraint:"CONSTRAINT ${name}CHECK (${expression})${enforcement}",createForeignKeyConstraint:"CONSTRAINT `${name}` FOREIGN KEY (${foreignKey}) REFERENCES ${primaryTable}(${primaryKey})",createKeyConstraint:"${constraintName}${keyType}${columns}${using}${blockSize}${comment}${ignore}",createForeignKey:"ALTER TABLE ${foreignTable} ADD CONSTRAINT `${name}` FOREIGN KEY (${foreignKey}) REFERENCES ${primaryTable}(${primaryKey});",index:"CREATE ${indexType}INDEX ${name}${indexCategory}\n	ON ${table} ( ${keys} )${indexOptions};\n",createView:"CREATE ${orReplace}${algorithm}${sqlSecurity}VIEW ${ifNotExist}${name} AS ${selectStatement}${checkOption};\n",viewSelectStatement:"SELECT ${keys}\n	FROM ${tableName}",createFunction:"CREATE ${definer}FUNCTION ${ifNotExist}${name}\n	(${parameters})\n	RETURNS ${type}\n	${characteristics}\n${body} ${delimiter}\n",createProcedure:"CREATE ${definer}PROCEDURE ${ifNotExist}${name}\n(${parameters})\n	${characteristics}\n${body} ${delimiter}\n",alterView:"ALTER${algorithm}${sqlSecurity} VIEW ${name}\nAS ${selectStatement}${checkOption};",dropDatabase:"DROP DATABASE IF EXISTS `${name}`;",alterDatabaseCharset:"ALTER DATABASE `${name}` CHARACTER SET='${characterSet}' COLLATE='${collation}';",alterDatabaseEncryption:"ALTER DATABASE `${name}` ENCRYPTION='${encryption}';",dropUdf:"DROP FUNCTION IF EXISTS ${name};",dropProcedure:"DROP PROCEDURE IF EXISTS ${name};",dropTable:"DROP${temporary} TABLE IF EXISTS ${name};",alterTable:"ALTER TABLE ${table} ${alterStatement};",dropIndex:"DROP INDEX ${indexName}",dropCheckConstraint:"DROP CHECK ${name}",addCheckConstraint:"ADD ${checkConstraint}",alterCharset:"${default}CHARACTER SET='${charset}'${collation}",dropView:"DROP VIEW IF EXISTS ${viewName};",addColumn:"ADD COLUMN ${columnDefinition}",dropColumn:"DROP COLUMN ${name}",renameColumn:"RENAME COLUMN ${oldName} TO ${newName}",changeColumn:"CHANGE ${oldName} ${columnDefinition}",modifyColumn:"MODIFY ${columnDefinition}",createTableSpace:"CREATE${undo} TABLESPACE ${name} ADD DATAFILE ${file}${AUTOEXTEND_SIZE}${FILE_BLOCK_SIZE}${ENCRYPTION}${logFile}${EXTENT_SIZE}${INITIAL_SIZE}${ENGINE};"}});var ae=v((Ze,oe)=>{"use strict";var _e=m(T=>Array.isArray(T)?T.reduce((y,g)=>({...y,[g.id]:g.value}),{}):{},"getAdditionalOptions");oe.exports=_e});var Ee=v((ke,ce)=>{"use strict";var be=m(({commentIfDeactivated:T})=>(y,g)=>{let d=!1;return{...g,...["dropDatabase","dropUdf","dropProcedure","dropTable","dropColumn","dropIndex","dropCheckConstraint","dropView"].reduce((S,A)=>({...S,[A]:(...L)=>{let I=g[A](...L);return d=d||!!I,y||!I?I:T(I,{isActivated:!1})}}),{}),isDropInStatements(){return d}}},"dropStatementProxy");ce.exports=be});var le=v((we,me)=>{"use strict";var Me=m(({index:T,numberOfStatements:y,lastIndexOfActivatedStatement:g,delimiter:d})=>{let S=T===y-1,A=T===g;return S?"":A?" --"+d:d},"getDelimiter"),Ye=m(({statements:T=[],delimiter:y=",",indent:g=`
`})=>{let d=T.findLastIndex(A=>!A.startsWith("--")),S=T.length;return T.map((A,L)=>{let I=Me({index:L,numberOfStatements:S,lastIndexOfActivatedStatement:d,delimiter:y});return A+I}).join(g)},"joinActivatedAndDeactivatedStatements");me.exports={joinActivatedAndDeactivatedStatements:Ye}});var de=v((ze,Te)=>{"use strict";Te.exports=(T,y)=>{let g=m((n,a)=>`${n}(${a})`,"addLength"),d=m((n,a,K)=>T.isNumber(K)?`${n}(${a},${K})`:`${n}(${a})`,"addScalePrecision"),S=m((n,a)=>`${n}(${a})`,"addPrecision"),A=m(n=>["CHAR","VARCHAR","BINARY","CHAR BYTE","VARBINARY","BLOB"].includes(n),"canHaveLength"),L=m(n=>["TINYINT","SMALLINT","MEDIUMINT","INT","INTEGER","BIGINT","INT1","INT2","INT3","INT4","INT8","FLOAT","DOUBLE","REAL","DECIMAL","DEC","NUMERIC","FIXED","NUMBER","DOUBLE PRECISION","BIT"].includes(n),"isNumeric"),I=m(n=>L(n),"canHavePrecision"),_=m(n=>["TIME","DATETIME","TIMESTAMP"].includes(n),"canHaveMicrosecondPrecision"),h=m(n=>["DECIMAL","FLOAT","DOUBLE","DEC","FIXED","NUMERIC","NUMBER","DOUBLE PRECISION","REAL"].includes(n),"canHaveScale"),G=m((n,a)=>A(n)&&T.isNumber(a.length)?g(n,a.length):I(n)&&h(n)&&T.isNumber(a.precision)?d(n,a.precision,a.scale):I(n)&&T.isNumber(a.precision)?S(n,a.precision):_(n)&&T.isNumber(a.microSecPrecision)?S(n,a.microSecPrecision):["ENUM","SET"].includes(n)&&!T.isEmpty(a.enum)?`${n}('${a.enum.join("', '")}')`:n,"decorateType"),u=m(n=>["CHAR","VARCHAR","TEXT","TINYTEXT","MEDIUMTEXT","LONGTEXT"].includes(T.toUpper(n)),"isString"),l=m(n=>["TIME","DATE","DATETIME","TIMESTAMP"].includes(n),"isDateTime"),O=m(n=>T.trim(n).replace(/(\')+/g,"'$1"),"escapeQuotes");return{decorateType:G,decorateDefault:m((n,a)=>{let K=/^(null|current_timestamp(\(\d+\))?)(\s+on\s+update\s+current_timestamp(\(\d+\))?)?$/i;return(u(n)||l(n))&&!K.test(T.trim(a))?y(O(a)):a},"decorateDefault"),canBeNational:m(n=>["CHAR","VARCHAR"].includes(n),"canBeNational"),isNumeric:L,getSign:m((n,a)=>L(n)&&a===!1?" UNSIGNED":"","getSign"),createGeneratedColumn:m(n=>{if(!n||!n.expression)return"";let a=T.toUpper(n.generated_storage||"");return" "+[n.generatedType==="always"?"GENERATED ALWAYS":"",`AS (${n.expression})`,a].filter(Boolean).join(" ")},"createGeneratedColumn"),canHaveAutoIncrement:m(n=>["tinyint","smallint","mediumint","int","bigint"].includes(n),"canHaveAutoIncrement")}}});var Ie=v((je,Ne)=>{"use strict";Ne.exports=(T,y)=>{let g={ENGINE:"ENGINE",AUTO_INCREMENT:"AUTO_INCREMENT",AVG_ROW_LENGTH:"AVG_ROW_LENGTH",CHECKSUM:"CHECKSUM",DATA_DIRECTORY:"DATA DIRECTORY",DELAY_KEY_WRITE:"DELAY_KEY_WRITE",INDEX_DIRECTORY:"INDEX DIRECTORY",ENCRYPTED:"ENCRYPTED",ENCRYPTION_KEY_ID:"ENCRYPTION_KEY_ID",IETF_QUOTES:"IETF_QUOTES",INSERT_METHOD:"INSERT_METHOD",UNION:"UNION",KEY_BLOCK_SIZE:"KEY_BLOCK_SIZE",MIN_ROWS:"MIN_ROWS",MAX_ROWS:"MAX_ROWS",PACK_KEYS:"PACK_KEYS",PAGE_CHECKSUM:"PAGE_CHECKSUM",PAGE_COMPRESSED:"PAGE_COMPRESSED",PAGE_COMPRESSION_LEVEL:"PAGE_COMPRESSION_LEVEL",ROW_FORMAT:"ROW_FORMAT",SEQUENCE:"SEQUENCE",STATS_AUTO_RECALC:"STATS_AUTO_RECALC",STATS_PERSISTENT:"STATS_PERSISTENT",TRANSACTIONAL:"TRANSACTIONAL",compression:"COMPRESSION",STATS_SAMPLE_PAGES:"STATS_SAMPLE_PAGES",ENCRYPTION:"ENCRYPTION",AUTOEXTEND_SIZE:"AUTOEXTEND_SIZE",CONNECTION:"CONNECTION"},d={MyISAM:["AUTO_INCREMENT","AVG_ROW_LENGTH","CHECKSUM","DATA_DIRECTORY","DELAY_KEY_WRITE","INDEX_DIRECTORY","KEY_BLOCK_SIZE","PACK_KEYS","ROW_FORMAT"],InnoDB:["AUTO_INCREMENT","DATA_DIRECTORY","INDEX_DIRECTORY","ENCRYPTION","AUTOEXTEND_SIZE","ROW_FORMAT","compression","STATS_AUTO_RECALC","STATS_PERSISTENT","STATS_SAMPLE_PAGES","KEY_BLOCK_SIZE"],CSV:["KEY_BLOCK_SIZE"],MERGE:["INSERT_METHOD","UNION","KEY_BLOCK_SIZE"],Memory:["AUTO_INCREMENT","KEY_BLOCK_SIZE","MIN_ROWS","MAX_ROWS"],Archive:["AUTO_INCREMENT","KEY_BLOCK_SIZE"],Federated:["CONNECTION","KEY_BLOCK_SIZE"],EXAMPLE:[],BLACKHOLE:[],HEAP:["AUTO_INCREMENT","KEY_BLOCK_SIZE","MIN_ROWS","MAX_ROWS"],NDB:["KEY_BLOCK_SIZE"]},S=m((r,o)=>o?`\`${o}\`.\`${r}\``:`\`${r}\``,"getTableName"),A=m((r,o)=>{if(["ROW_FORMAT","INSERT_METHOD"].includes(r))return o?T.toUpper(o):void 0;if(r==="UNION")return o;if(["YES","NO","DEFAULT"].includes(T.toUpper(o)))return{YES:"'Y'",NO:"'N'"}[T.toUpper(o)]||T.toUpper(o);if(typeof o=="number")return o;if(!isNaN(+o)&&o)return+o;if(typeof o=="string"&&o)return y(o);if(typeof o=="boolean")return o?"'Y'":"'N'"},"getOptionValue"),L=m((r="")=>r.replace(/(?<!\\)('|"|`)/gi,"\\$1").replace(/\n/gi,"\\n"),"encodeStringLiteral"),I=m((r={})=>{let o=[],n=r.ENGINE;if(r.defaultCharSet||(r.characterSet&&o.push(`CHARSET=${r.characterSet}`),r.collation&&o.push(`COLLATE=${r.collation}`)),n&&o.push(`ENGINE = ${n}`),r.description&&o.push(`COMMENT = '${L(r.description)}'`),(d[n]||["KEY_BLOCK_SIZE"]).forEach(K=>{let X=A(K,r[K]);if(X===void 0)return;let q=`${g[K]} = ${X}`;o.push(q)}),["InnoDB","NDB"].includes(n)){let K="";r.TABLESPACE&&(K=`TABLESPACE ${r.TABLESPACE}`),n==="NDB"&&r.STORAGE&&(K+=` STORAGE ${r.STORAGE}`),K&&o.push(K.trim())}return o.length?" "+o.join(`,
	`):""},"getTableOptions"),_=m(r=>r?"LINEAR ":"","addLinear"),h=m(r=>{let o=` (${T.trim(r.partitioning_expression)})`,n="";return["RANGE","LIST"].includes(r.partitionType)&&r.partitioning_columns&&(o=` COLUMNS(${T.trim(r.partitioning_columns)})`),r.partitionType==="KEY"&&r.ALGORITHM&&(n=` ALGORITHM ${r.ALGORITHM}`),`${_(r.LINEAR)}${r.partitionType}${n}${o}`},"getPartitionBy"),G=m(r=>{if(!r.subpartitionType)return"";let o="";return r.subpartitionType==="KEY"&&r.SUBALGORITHM&&(o=` ALGORITHM ${r.SUBALGORITHM} `),`SUBPARTITION BY ${_(r.SUBLINEAR)}${r.subpartitionType}${o}(${T.trim(r.subpartitioning_expression)})`},"getSubPartitionBy"),u=m(r=>{if(!Array.isArray(r.partition_definitions))return"";let o=r.partition_definitions.filter(({partitionDefinition:n})=>n).map(n=>{let a=n.subpartitionDefinition;return a?n.partitionDefinition+" "+y(a,"(",")"):n.partitionDefinition}).join(`,
		`);return o?y(`
		`+o+`
	`,"(",")"):""},"getPartitionDefinitions"),l=m((r={})=>{if(!r.partitionType)return"";let o=`PARTITION BY ${h(r)}`,n=r.partitions?`PARTITIONS ${r.partitions}`:"",a=G(r),K=r.subpartitions?`SUBPARTITIONS ${r.subpartitions}`:"",X=u(r),q=[o,n,a,K,X].filter(Boolean);return q.length?`
	`+q.join(`
	`):""},"getPartitions"),O=m(r=>r?r.alias?`\`${r.name}\` as \`${r.alias}\``:`\`${r.name}\``:"","getKeyWithAlias"),b=m((r,o="")=>Array.isArray(r)?r.reduce((n,a)=>{if(!a.tableName)return n.columns.push(O(a)),n;let K=`\`${a.dbName||o}\`.\`${a.tableName}\``;return n.tables.includes(K)||n.tables.push(K),n.columns.push({statement:`${K}.${O(a)}`,isActivated:a.isActivated}),n},{tables:[],columns:[]}):{tables:[],columns:[]},"getViewData"),P=m(r=>{let o=[];return r.language&&o.push("LANGUAGE SQL"),r.deterministic&&o.push(r.deterministic),r.contains&&o.push(r.contains),r.sqlSecurity&&o.push(`SQL SECURITY ${r.sqlSecurity}`),r.comment&&o.push(`COMMENT ${y(E(r.comment))}`),o},"getCharacteristics"),E=m((r="")=>r.replace(/(')/gi,"'$1").replace(/\n/gi,"\\n"),"escapeQuotes");return{getTableName:S,getTableOptions:I,getPartitions:l,getViewData:b,getCharacteristics:P,escapeQuotes:E}}});var Ae=v((et,ue)=>{"use strict";ue.exports=({_:T,commentIfDeactivated:y,checkAllKeysDeactivated:g,divideIntoActivatedAndDeactivated:d,assignTemplates:S,escapeQuotes:A})=>{let L=m((u,l)=>{var E,r;let O=y(((u==null?void 0:u.deactivatedItems)||[]).join(`,
	`),{isActivated:!l,isPartOfLine:!0}),b=(E=u==null?void 0:u.activatedItems)!=null&&E.length?`,
	`+u.activatedItems.join(`,
	`):"",P=(r=u==null?void 0:u.deactivatedItems)!=null&&r.length?`
	`+O:"";return b+P},"generateConstraintsString"),I=m(u=>{if(Array.isArray(u)){let l=u.filter(P=>T.get(P,"isActivated",!0)).map(P=>`\`${T.trim(P.name)}\``),O=u.filter(P=>!T.get(P,"isActivated",!0)).map(P=>`\`${T.trim(P.name)}\``),b=O.length?y(O,{isActivated:!1,isPartOfLine:!0}):"";return l.join(", ")+b}return u},"foreignKeysToString"),_=m(u=>u.map(l=>T.trim(l.name)).join(", "),"foreignActiveKeysToString"),h=m((u,l)=>O=>{let b=g(O.columns||[]),P=G(b,l,O.columns),E=O.category?` USING ${O.category}`:"",r=O.ignore?" IGNORED":"",o=O.comment?` COMMENT '${A(O.comment)}'`:"",n=O.blockSize?` KEY_BLOCK_SIZE=${O.blockSize}`:"";return{statement:S(u.createKeyConstraint,{constraintName:O.name?`CONSTRAINT \`${T.trim(O.name)}\` `:"",keyType:O.keyType,blockSize:n,columns:P,comment:o,ignore:r,using:E}),isActivated:!b}},"createKeyConstraint"),G=m((u,l,O)=>{var r;if(!O)return"";let b=m(({name:o,order:n})=>`\`${o}\` ${n}`.trim(),"columnMapToString"),P=d(O,b),E=(r=P==null?void 0:P.deactivatedItems)!=null&&r.length?y(P.deactivatedItems.join(", "),{isActivated:!1,isPartOfLine:!0}):"";return!u&&l?" ("+P.activatedItems.join(", ")+E+")":" ("+O.map(b).join(", ")+")"},"getKeyColumns");return{generateConstraintsString:L,foreignKeysToString:I,foreignActiveKeysToString:_,createKeyConstraint:h}}});var ye=v((rt,pe)=>{"use strict";pe.exports=(T,y)=>{let g=m((E,r)=>Object.entries(E.properties).map(r),"mapProperties"),d=m(E=>E.compositeUniqueKey?!1:!!E.unique,"isUniqueKey"),S=m(E=>{var r,o;return d(E)&&(((r=E.uniqueKeyOptions)==null?void 0:r.length)===1&&!((o=T.first(E.uniqueKeyOptions))!=null&&o.constraintName)||T.isEmpty(E.uniqueKeyOptions))},"isInlineUnique"),A=m(E=>E.compositeUniqueKey||E.compositePrimaryKey?!1:!!E.primaryKey,"isPrimaryKey"),L=m(E=>{var r;return A(E)&&!((r=E.primaryKeyOptions)!=null&&r.constraintName)},"isInlinePrimaryKey"),I=m(E=>T.toLower(E)==="asc"?"ASC":T.toLower(E)==="desc"?"DESC":"","getOrder"),_=m((E,r,o)=>y({keyType:"UNIQUE",name:E.constraintName,columns:[{name:r,order:I(E.order||E.indexOrder),isActivated:o}],category:E.indexCategory,ignore:E.indexIgnore,comment:E.indexComment,blockSize:E.indexBlockSize}),"hydrateUniqueOptions"),h=m((E,r,o)=>y({keyType:"PRIMARY KEY",name:E.constraintName,columns:[{name:r,order:I(E.order||E.indexOrder),isActivated:o}],category:E.indexCategory,ignore:E.indexIgnore,comment:E.indexComment,blockSize:E.indexBlockSize}),"hydratePrimaryKeyOptions"),G=m((E,r)=>Object.keys(r).find(o=>r[o].GUID===E),"findName"),u=m((E,r)=>T.get(Object.values(r).find(o=>o.GUID===E),"isActivated",!0),"checkIfActivated"),l=m((E,r)=>E.map(o=>({name:G(o.keyId,r.properties),order:{descending:"DESC",ascending:"ASC"}[o.type]||"",isActivated:u(o.keyId,r.properties)})),"getKeys"),O=m(E=>Array.isArray(E.primaryKey)?E.primaryKey.filter(r=>!T.isEmpty(r.compositePrimaryKey)).map(r=>({...h(r),columns:l(r.compositePrimaryKey,E)})):[],"getCompositePrimaryKeys"),b=m(E=>Array.isArray(E.uniqueKey)?E.uniqueKey.filter(r=>!T.isEmpty(r.compositeUniqueKey)).map(r=>({..._(r),columns:l(r.compositeUniqueKey,E)})):[],"getCompositeUniqueKeys");return{getTableKeyConstraints:m(({jsonSchema:E})=>{if(!E.properties)return[];let r=g(E,([n,a])=>{if(!(!A(a)||L(a)))return h(a.primaryKeyOptions,n,a.isActivated)}).filter(Boolean),o=T.flatten(g(E,([n,a])=>!d(a)||S(a)?[]:(a.uniqueKeyOptions||[]).map(K=>_(K,n,a.isActivated)))).filter(Boolean);return[...r,...O(E),...o,...b(E)]},"getTableKeyConstraints"),isInlineUnique:S,isInlinePrimaryKey:L,hydratePrimaryKeyOptions:h,hydrateUniqueOptions:_}}});var Oe=v((it,Se)=>{"use strict";Se.exports=T=>{let y=m((S,A)=>{var _,h,G;let L=m(u=>/\[\d*\]/.test(u),"isArrayItem"),I=A;for(let u=0;u<S.length;u++){let l=S[u];if(!I)return;L(l)?Array.isArray(I.items)?I=I.items[+((_=l.match(/\[(\d*)\]/))==null?void 0:_[1])||0]:I=I.items:(h=I.properties)!=null&&h[l]&&(I=(G=I.properties)==null?void 0:G[l])}return I},"findProperty"),g=m(S=>S.type==="jsonArray"?"UNSIGNED ARRAY":S.type==="jsonNumber"?"DECIMAL(5,2)":`CHAR(${S.maxLength||S.minLength||50})`,"getCastingTypeBySchema");return{processIndexKeyName:m(({name:S,type:A,jsonSchema:L})=>{let I=S.split(".");if(I.length<=1)return`\`${S}\`${A==="DESC"?" DESC":""}`;let _=y(I,L);return _?`(CAST(${T(I[0],"`","`")}->'$.${I.slice(1).join(".")}' AS ${g(_)}))`:`\`${S}\`${A==="DESC"?" DESC":""}`},"processIndexKeyName")}}});var Be=te(),Ce=ne(),N=se(),Ge=ae(),ve=Ee(),{joinActivatedAndDeactivatedStatements:Fe}=le();module.exports=(T,y,g)=>{let d=g.require("lodash"),{tab:S,commentIfDeactivated:A,checkAllKeysDeactivated:L,divideIntoActivatedAndDeactivated:I,hasType:_,wrap:h,clean:G,getDifferentProperties:u}=g.require("@hackolade/ddl-fe-utils").general,{assignTemplates:l,compareGroupItems:O}=g.require("@hackolade/ddl-fe-utils"),{decorateDefault:b,decorateType:P,canBeNational:E,getSign:r,createGeneratedColumn:o,canHaveAutoIncrement:n}=de()(d,h),{getTableName:a,getTableOptions:K,getPartitions:X,getViewData:q,getCharacteristics:z,escapeQuotes:D}=Ie()(d,h),{generateConstraintsString:Q,foreignKeysToString:k,foreignActiveKeysToString:j,createKeyConstraint:w}=Ae()({_:d,commentIfDeactivated:A,checkAllKeysDeactivated:L,divideIntoActivatedAndDeactivated:I,assignTemplates:l,escapeQuotes:D}),Z=ye()(d,G),{processIndexKeyName:fe}=Oe()(h),J=Ge(y.additionalOptions);return ve({commentIfDeactivated:A})(J.applyDropStatements,{createDatabase({databaseName:e,ifNotExist:t,collation:i,characterSet:c,encryption:s,udfs:f,procedures:R,tablespaces:C,useDb:U=!0}){let $="";$+=c?S(`
CHARACTER SET = '${c}'`):"",$+=i?S(`
COLLATE = '${i}'`):"",$+=s?S(`
ENCRYPTION = 'Y'`):"";let Y=l(N.createDatabase,{name:e,ifNotExist:t?" IF NOT EXISTS":"",dbOptions:$,useDb:U?`USE \`${e}\`;
`:""}),p=f.map(M=>this.createUdf(e,M)),B=R.map(M=>this.createProcedure(e,M));return[...C.map(M=>this.createTableSpace(M)).filter(Boolean),Y,...p,...B].join(`
`)},dropDatabase(e){return l(N.dropDatabase,e)},alterDatabase(e){var c,s,f,R,C,U,$,Y;let t=[],i=e.name;return J.excludeContainerAlterStatements?"":((e.collation||e.characterSet)&&t.push(l(N.alterDatabaseCharset,{name:i,characterSet:e.characterSet,collation:e.collation})),e.encryption&&t.push(l(N.alterDatabaseEncryption,{name:i,encryption:e.encryption})),d.isEmpty((c=e.udfs)==null?void 0:c.deleted)||(s=e.udfs)==null||s.deleted.forEach(p=>{t.push(this.dropUdf(i,p))}),d.isEmpty((f=e.udfs)==null?void 0:f.added)||e.udfs.added.forEach(p=>{t.push(this.createUdf(i,p))}),d.isEmpty((R=e.udfs)==null?void 0:R.modified)||e.udfs.modified.forEach(p=>{t.push(this.dropUdf(i,p.old)+`
`+this.createUdf(i,p.new))}),d.isEmpty((C=e.procedures)==null?void 0:C.deleted)||(U=e.procedures)==null||U.deleted.forEach(p=>{t.push(this.dropProcedure(i,p))}),d.isEmpty(($=e.procedures)==null?void 0:$.added)||e.procedures.added.forEach(p=>{t.push(this.createProcedure(i,p))}),d.isEmpty((Y=e.procedures)==null?void 0:Y.modified)||e.procedures.modified.forEach(p=>{t.push(this.dropProcedure(i,p.old)+`
`+this.createProcedure(i,p.new))}),t.join(`

`))},createTableSpace(e){if(!e.name||!e.DATAFILE||e.ENGINE==="NDB"&&!e.LOGFILE_GROUP)return"";let t="";return e.ENGINE==="NDB"?t=l(N.createTableSpace,{undo:e.UNDO?" UNDO":"",name:e.name,file:h(e.DATAFILE,"'","'"),AUTOEXTEND_SIZE:e.AUTOEXTEND_SIZE?` AUTOEXTEND_SIZE=${e.AUTOEXTEND_SIZE}`:"",logFile:` USE LOGFILE GROUP ${e.LOGFILE_GROUP}`,EXTENT_SIZE:e.EXTENT_SIZE?` EXTENT_SIZE=${e.EXTENT_SIZE}`:"",INITIAL_SIZE:e.INITIAL_SIZE?` INITIAL_SIZE=${e.INITIAL_SIZE}`:"",ENGINE:" ENGINE=NDB"}):t=l(N.createTableSpace,{undo:e.UNDO?" UNDO":"",name:e.name,file:h(e.DATAFILE,"'","'"),AUTOEXTEND_SIZE:e.AUTOEXTEND_SIZE?` AUTOEXTEND_SIZE=${e.AUTOEXTEND_SIZE}`:"",FILE_BLOCK_SIZE:e.FILE_BLOCK_SIZE?` FILE_BLOCK_SIZE=${e.FILE_BLOCK_SIZE}`:"",ENCRYPTION:e.ENCRYPTION?` ENCRYPTION=${e.ENCRYPTION}`:"",ENGINE:" ENGINE=InnoDB"}),A(t,{isActivated:e.isActivated})+`
`},createUdf(e,t){let i=z(t.characteristics),c=t.delimiter?`DELIMITER ${t.delimiter}
`:"",s=t.delimiter?`DELIMITER ;
`:"";return c+l(N.createFunction,{name:a(t.name,e),definer:t.definer?`DEFINER=${t.definer} `:"",ifNotExist:t.ifNotExist?"IF NOT EXISTS ":"",characteristics:i.join(`
	`),type:t.type,parameters:t.parameters,body:t.body,delimiter:t.delimiter||";"})+s},createProcedure(e,t){let i=z(t.characteristics),c=t.delimiter?`DELIMITER ${t.delimiter}
`:"",s=t.delimiter?`DELIMITER ;
`:"";return c+l(N.createProcedure,{name:a(t.name,e),ifNotExist:t.ifNotExist?"IF NOT EXISTS ":"",definer:t.definer?`DEFINER=${t.definer} `:"",parameters:t.parameters,characteristics:i.join(`
	`),body:t.body,delimiter:t.delimiter||";"})+s},dropUdf(e,t){return l(N.dropUdf,{name:a(t.name,e)})},dropProcedure(e,t){return l(N.dropProcedure,{name:a(t.name,e)})},createTable({name:e,columns:t,dbData:i,temporary:c,ifNotExist:s,likeTableName:f,selectStatement:R,options:C,partitioning:U,checkConstraints:$,foreignKeyConstraints:Y,keyConstraints:p,selectIgnore:B,selectReplace:F},M){let x=a(e,i.databaseName),H=c?"TEMPORARY ":"",V=s?"IF NOT EXISTS ":"";if(f)return A(l(N.createLikeTable,{name:x,likeTableName:a(f,i.databaseName),temporary:H,ifNotExist:V}),{isActivated:M});let Re=I(p.map(w(N,M)),W=>W.statement),$e=Q(Re,M),Le=I(Y,W=>W.statement),he=Q(Le,M),ge=R?B?" IGNORE":F?" REPLACE":"":"",Ke=Fe({statements:t,indent:`
	`}),Pe=l(N.createTable,{name:x,column_definitions:Ke,selectStatement:R?` AS ${R}`:"",temporary:H,ifNotExist:V,options:K(C),partitions:X(U),checkConstraints:$.length?`,
	`+$.join(`,
	`):"",foreignKeyConstraints:he,keyConstraints:$e,ignoreReplace:ge});return A(Pe,{isActivated:M})},dropTable({name:e,dbName:t,temporary:i}){return l(N.dropTable,{name:a(e,t),temporary:i?" TEMPORARY":""})},alterTable({name:e,collationOptions:t},i){let c=a(e,i.databaseName);return t?l(N.alterTable,{table:c,alterStatement:l(N.alterCharset,{charset:t.characterSet,default:t.defaultCharSet?"DEFAULT ":"",collation:t.collation?` COLLATE='${t.collation}'`:""})}):""},convertColumnDefinition(e){let t=d.toUpper(e.type),i=e.nullable?"":" NOT NULL",c=e.primaryKey?" "+w(N,!0)(e.primaryKeyOptions).statement:"",s=e.unique?" "+w(N,!0)(e.uniqueKeyOptions).statement:"",f=e.zerofill?" ZEROFILL":"",R=e.autoIncrement?" AUTO_INCREMENT":"",C=e.invisible?" INVISIBLE":"",U=e.national&&E(t)?"NATIONAL ":"",$=e.comment?` COMMENT '${D(e.comment)}'`:"",Y=t!=="JSON"&&e.charset?` CHARSET ${e.charset}`:"",p=t!=="JSON"&&e.charset&&e.collation?` COLLATE ${e.collation}`:"",B=o(e.generatedDefaultValue),F=!d.isUndefined(e.default)&&!B?" DEFAULT "+b(t,e.default):"",M=e.compressionMethod?` COMPRESSED=${e.compressionMethod}`:"",x=r(t,e.signed);return A(l(N.columnDefinition,{name:e.name,type:P(t,e),not_null:i,primary_key:c,unique_key:s,default:F,generatedDefaultValue:B,autoIncrement:R,compressed:M,signed:x,zeroFill:f,invisible:C,comment:$,national:U,charset:Y,collate:p}),{isActivated:e.isActivated})},addColumn(e,t,i){let c=a(e,i.databaseName);return l(N.alterTable,{table:c,alterStatement:l(N.addColumn,{columnDefinition:this.convertColumnDefinition(t)})})},dropColumn(e,t,i){let c=a(e,i.databaseName);return l(N.alterTable,{table:c,alterStatement:l(N.dropColumn,{name:h(t.name,"`","`")})})},alterColumn(e,t,i){let c=a(e,i.databaseName),s="";return t.oldName&&!t.newOptions?s=l(N.renameColumn,{oldName:h(t.oldName,"`","`"),newName:h(t.name,"`","`")}):t.oldName&&t.newOptions?s=l(N.changeColumn,{oldName:h(t.oldName,"`","`"),columnDefinition:this.convertColumnDefinition({...t,isActivated:!0})}):s=l(N.modifyColumn,{columnDefinition:this.convertColumnDefinition({...t,isActivated:!0})}),A(l(N.alterTable,{table:c,alterStatement:s}),{isActivated:t.isActivated})},createIndex(e,t,i,c=!0,s){if(d.isEmpty(t.indxKey)&&d.isEmpty(t.indxExpression)||!t.indxName)return"";let f=L(t.indxKey||[]),R=t.isActivated===!1||!c||f,C=t.indexType&&d.toUpper(t.indexType)!=="KEY"?`${d.toUpper(t.indexType)} `:"",U=h(t.indxName||"","`","`"),$=a(e,i.databaseName),Y=t.indexCategory?` USING ${t.indexCategory}`:"",p=[],B=I(t.indxKey||[],H=>fe({name:H.name,type:H.type,jsonSchema:s})),F=B.deactivatedItems.length?A(B.deactivatedItems.join(", "),{isActivated:R,isPartOfLine:!0}):"",M=(t.indxExpression||[]).map(H=>{var V;return(V=H.value)==null?void 0:V.replace(/\\/g,"\\\\")}).filter(Boolean);t.indxKeyBlockSize&&p.push(`KEY_BLOCK_SIZE = ${t.indxKeyBlockSize}`),t.indexType==="FULLTEXT"&&t.indxParser&&p.push(`WITH PARSER ${t.indxParser}`),t.indexComment&&p.push(`COMMENT '${D(t.indexComment)}'`),t.indxVisibility&&p.push(t.indxVisibility),t.indexLock?p.push(`LOCK ${t.indexLock}`):t.indexAlgorithm&&p.push(`ALGORITHM ${t.indexAlgorithm}`);let x=l(N.index,{keys:M.length?`${M.join(", ")}`:B.activatedItems.join(", ")+(R&&F&&B.activatedItems.length?", "+F:F),indexOptions:p.length?`
	`+p.join(`
	`):"",name:U,table:$,indexType:C,indexCategory:Y});return R?A(x,{isActivated:!1}):x},dropIndex(e,t,i){if(!t.indxName)return"";let c=a(e,i.databaseName),s=h(t.indxName,"`","`");return l(N.alterTable,{table:c,alterStatement:l(N.dropIndex,{indexName:s})})},alterIndex(e,{new:t,old:i},c){return[this.dropIndex(e,i,c),this.createIndex(e,{...t,indxKey:t.indxKey.filter(s=>s.isActivated!==!1)},c)].join(`
`)},createCheckConstraint(e){return l(N.checkConstraint,{name:e.name?`${h(e.name,"`","`")} `:"",expression:d.trim(e.expression).replace(/^\(([\s\S]*)\)$/,"$1"),enforcement:e.enforcement?` ${e.enforcement}`:""})},createCheckConstraintStatement(e,t,i){let c=a(e,i.databaseName);return l(N.alterTable,{table:c,alterStatement:l(N.addCheckConstraint,{checkConstraint:this.createCheckConstraint(t)})})},dropCheckConstraint(e,t,i){let c=a(e,i.databaseName);return l(N.alterTable,{table:c,alterStatement:l(N.dropCheckConstraint,{name:h(t.name,"`","`")})})},alterCheckConstraint(e,{new:t,old:i},c){return[this.dropCheckConstraint(e,i,c),this.createCheckConstraintStatement(e,t,c)].join(`
`)},createForeignKeyConstraint({name:e,foreignKey:t,primaryTable:i,primaryKey:c,primaryTableActivated:s,foreignTableActivated:f},R){let C=L(c),U=L(t),$=!C&&!U&&s&&f;return{statement:l(N.createForeignKeyConstraint,{primaryTable:a(i,R.databaseName),name:e,foreignKey:$?k(t):j(t),primaryKey:$?k(c):j(c)}),isActivated:$}},createForeignKey({name:e,foreignTable:t,foreignKey:i,primaryTable:c,primaryKey:s,primaryTableActivated:f,foreignTableActivated:R},C){let U=L(s),$=L(i);return{statement:l(N.createForeignKey,{primaryTable:a(c,C.databaseName),foreignTable:a(t,C.databaseName),name:e,foreignKey:k(i),primaryKey:k(s)}),isActivated:!U&&!$&&f&&R}},createView(e,t,i){let{deactivatedWholeStatement:c,selectStatement:s}=this.viewSelectStatement(e,i,t),f=e.algorithm&&e.algorithm!=="UNDEFINED"?`ALGORITHM=${e.algorithm} `:"";return A(l(N.createView,{name:a(e.name,t.databaseName),orReplace:e.orReplace?"OR REPLACE ":"",ifNotExist:e.ifNotExist?"IF NOT EXISTS ":"",sqlSecurity:e.sqlSecurity?`SQL SECURITY ${e.sqlSecurity} `:"",checkOption:e.checkOption?`
WITH ${e.checkOption} CHECK OPTION`:"",selectStatement:s,algorithm:f}),{isActivated:!c})},viewSelectStatement(e,t=!0,i){let s=L(e.keys||[])||!t,{columns:f,tables:R}=q(e.keys,i.databaseName),C=f.map($=>$.statement).join(`,
		`);if(!s){let $=I(f,p=>p.statement),Y=$.deactivatedItems.length?A($.deactivatedItems.join(`,
		`),{isActivated:!1,isPartOfLine:!0}):"";C=$.activatedItems.join(`,
		`)+Y}let U=d.trim(e.selectStatement)?d.trim(S(e.selectStatement)):l(N.viewSelectStatement,{tableName:R.join(", "),keys:C});return{deactivatedWholeStatement:s,selectStatement:U}},dropView({name:e,dbData:t}){let i=a(e,t.databaseName);return l(N.dropView,{viewName:i})},alterView(e,t){if(d.isEmpty(e.options))return"";let i=a(e.name,t.databaseName),{selectStatement:c}=this.viewSelectStatement(e,!0,t),s=e.options||{};return l(N.alterView,{name:i,selectStatement:c,algorithm:s.algorithm&&s.algorithm!=="UNDEFINED"?` ALGORITHM=${s.algorithm}`:"",sqlSecurity:s.sqlSecurity?` SQL SECURITY ${s.sqlSecurity}`:"",checkOption:s.checkOption?`
WITH ${s.checkOption} CHECK OPTION`:""})},createViewIndex(e,t,i,c){return""},createUdt(e,t){return""},getDefaultType(e){return Be[e]},getTypesDescriptors(){return Ce},hasType(e){return _(Ce,e)},hydrateColumn({columnDefinition:e,jsonSchema:t,dbData:i}){return{name:e.name,type:e.type,primaryKey:Z.isInlinePrimaryKey(t),primaryKeyOptions:d.omit(Z.hydratePrimaryKeyOptions(t.primaryKeyOptions||{}),"columns"),unique:Z.isInlineUnique(t),uniqueKeyOptions:d.omit(Z.hydrateUniqueOptions(d.first(t.uniqueKeyOptions)||{}),"columns"),nullable:e.nullable,default:e.default,comment:e.description||t.refDescription||t.description,isActivated:e.isActivated,scale:e.scale,precision:e.precision,length:e.length,national:t.national,zerofill:t.zerofill,invisible:t.invisible,compressionMethod:t.compressed?t.compression_method:"",enum:t.enum,synonym:t.synonym,signed:t.zerofill||t.signed,microSecPrecision:t.microSecPrecision,charset:t.characterSet,collation:t.collation,generatedDefaultValue:t.generatedDefaultValue,...n(e.type)&&{autoIncrement:t.autoincrement}}},hydrateDropColumn({name:e}){return{name:e}},hydrateAlterColumn({newColumn:e,oldColumn:t,newColumnSchema:i,oldColumnSchema:c,oldCompData:s,newCompData:f}){let R=u(e,t,["name","type"]),C={...e};return s.name!==f.name&&(C.oldName=s.name),s.type!==f.type&&(C.oldType=s.type),d.isEmpty(R)||(C.newOptions=R),C},hydrateIndex(e,t){var i,c;return{indxName:(e==null?void 0:e.indxName)||"",indxKey:(i=e==null?void 0:e.indxKey)==null?void 0:i.map(s=>({name:s.name,type:s.type,isActivated:s.isActivated})),indxExpression:(c=e==null?void 0:e.indxExpression)==null?void 0:c.map(s=>({value:s.value})),isActivated:e==null?void 0:e.isActivated,indexType:e==null?void 0:e.indexType,indexCategory:e==null?void 0:e.indexCategory,indxKeyBlockSize:e==null?void 0:e.indxKeyBlockSize,indxParser:e==null?void 0:e.indxParser,indexComment:e==null?void 0:e.indexComment,indxVisibility:e==null?void 0:e.indxVisibility,indexLock:e==null?void 0:e.indexLock,indexAlgorithm:e==null?void 0:e.indexAlgorithm}},hydrateViewIndex(e){return{}},hydrateCheckConstraint(e){return{name:e.chkConstrName,expression:e.constrExpression,enforcement:e.constrEnforcement}},hydrateDatabase(e,t){var i,c;return{databaseName:e.name,ifNotExist:e.ifNotExist,characterSet:e.characterSet,collation:e.collation,encryption:e.ENCRYPTION==="Yes",udfs:((t==null?void 0:t.udfs)||[]).map(this.hydrateUdf),procedures:((t==null?void 0:t.procedures)||[]).map(this.hydrateProcedure),tablespaces:(((c=(i=t==null?void 0:t.modelData)==null?void 0:i[2])==null?void 0:c.tablespaces)||[]).map(this.hydrateTableSpace)}},hydrateTableSpace(e){return{name:e.name,isActivated:e.isActivated,DATAFILE:e.DATAFILE,UNDO:e.UNDO,AUTOEXTEND_SIZE:e.AUTOEXTEND_SIZE,ENGINE:e.ENGINE,FILE_BLOCK_SIZE:e.UNDO?"":e.FILE_BLOCK_SIZE,ENCRYPTION:{Yes:"Y",No:"N"}[e.ENCRYPTION]||"",LOGFILE_GROUP:e.LOGFILE_GROUP,EXTENT_SIZE:e.EXTENT_SIZE,INITIAL_SIZE:e.INITIAL_SIZE}},hydrateTable({tableData:e,entityData:t,jsonSchema:i}){let c=t[0],s=d.get(e,`relatedSchemas[${c.like}]`,"");return{...e,keyConstraints:Z.getTableKeyConstraints({jsonSchema:i}),temporary:c.temporary,ifNotExist:!c.orReplace&&c.ifNotExist,likeTableName:(s==null?void 0:s.code)||(s==null?void 0:s.collectionName),selectStatement:d.trim(c.selectStatement),options:{...c.tableOptions,description:c.description},partitioning:c.partitioning,selectIgnore:c.selectIgnore,selectReplace:c.selectReplace}},hydrateDropTable({tableData:e,entityData:t}){let i=t[0];return{name:e.name,dbName:e.dbData.databaseName,temporary:i==null?void 0:i.temporary}},hydrateViewColumn(e){return{name:e.name,tableName:e.entityName,alias:e.alias,isActivated:e.isActivated,dbName:e.dbName}},hydrateView({viewData:e,entityData:t,relatedSchemas:i,relatedContainers:c}){let s=t[0];return{name:e.name,keys:e.keys,orReplace:s.orReplace,ifNotExist:s.ifNotExist,selectStatement:s.selectStatement,sqlSecurity:s.SQL_SECURITY,algorithm:s.algorithm,checkOption:s.withCheckOption?s.checkTestingScope:""}},hydrateDropView({tableData:e}){return{name:e.name,dbData:e.dbData}},hydrateAlterView({name:e,newEntityData:t,oldEntityData:i,viewData:c,jsonSchema:s}){var U;let f=this.hydrateView({viewData:{},entityData:t}),R=this.hydrateView({viewData:{},entityData:i}),C=u(f,R);return{name:e,keys:c.keys,selectStatement:C.selectStatement||((U=t[0])==null?void 0:U.selectStatement),options:C}},commentIfDeactivated(e,t,i){return e},hydrateUdf(e){return{name:e.name,delimiter:e.functionDelimiter,ifNotExist:e.functionIfNotExist,definer:e.functionDefiner,parameters:e.functionArguments,type:e.functionReturnType,characteristics:{sqlSecurity:e.functionSqlSecurity,language:e.functionLanguage,contains:e.functionContains,deterministic:e.functionDeterministic,comment:e.functionDescription},body:e.functionBody}},hydrateProcedure(e){return{delimiter:e.delimiter,definer:e.definer,ifNotExist:e.procedureIfNotExist,name:e.name,parameters:e.inputArgs,body:e.body,characteristics:{comment:e.comments,contains:e.contains,language:e.language,deterministic:e.deterministic,sqlSecurity:e.securityMode}}},hydrateDropDatabase(e){var t;return{name:((t=e[0])==null?void 0:t.name)||""}},hydrateAlterDatabase({containerData:e,compModeData:t}){let i=e[0]||{},c=t.new.characterSet!==t.old.characterSet,s=t.new.collation!==t.old.collation,f=t.new.ENCRYPTION!==t.old.ENCRYPTION,R=O((t.old.Procedures||[]).map(this.hydrateProcedure),(t.new.Procedures||[]).map(this.hydrateProcedure)),C=O((t.old.UDFs||[]).map(this.hydrateUdf),(t.new.UDFs||[]).map(this.hydrateUdf));return{name:i.name||"",...c||s?{characterSet:i.characterSet,collation:i.collation}:{},...f?{encryption:i.ENCRYPTION==="Yes"?"Y":"N"}:{},procedures:R,udfs:C}},hydrateAlterTable({name:e,newEntityData:t,oldEntityData:i,jsonSchema:c}){var C,U,$;let s=t[0],f=i[0],R=["defaultCharSet","characterSet","collation"].some(Y=>{var p,B;return((p=f.tableOptions)==null?void 0:p[Y])!==((B=s.tableOptions)==null?void 0:B[Y])});return{name:e,collationOptions:R?{defaultCharSet:(C=s.tableOptions)==null?void 0:C.defaultCharSet,characterSet:(U=s.tableOptions)==null?void 0:U.characterSet,collation:($=s.tableOptions)==null?void 0:$.collation}:null}}})};
