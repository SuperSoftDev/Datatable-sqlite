from flask import Flask, render_template, g, request
import sqlite3
import json
import sys
import pandas as pd
app=Flask(__name__)

## ---- DB functions ------- ####
DATABASE = 'database.sqlite3'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

#######################################


#####  Main root ##################3
@app.route('/')
def index():
	conn = get_db()
	result = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%'",conn)
	total_data = []
	for item in result.values:
		result = pd.read_sql_query("select * from "+item[0],conn)
		data = []
		columns = []
		for item1 in result.columns.values:
			columns.append(item1)
		result = query_db("select * from "+item[0])
		data.append(item[0])
		data.append(columns)
		data.append(result)
		total_data.append(data);
	print(total_data)
	return render_template('index.html',total_data=total_data)

@app.route('/table/<tablename>')
def changetable(tablename):
	conn = get_db()
	result = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%'",conn)
	tables = []
	for item in result.values:
		tables.append(item[0])
	result = pd.read_sql_query("select * from "+tablename,conn)
	columns = []
	for item in result.columns.values:
		columns.append(item)	
	return render_template('index.html',tables=tables, tablename=tablename ,columns=columns, columns_json=json.dumps(columns), data=result.values)
##### database - add, delete, update  ######

@app.route('/add', methods=['GET','POST'])
def add():
	param = json.loads(request.form['param'])
	tablename = json.loads(request.form['tablename'])
	conn = get_db()
	result = pd.read_sql_query("select * from "+tablename,conn)
	columns = result.columns.values
	sql_query = 'insert into '+ tablename + ' values ('
	for i in range(len(columns)-1):
		sql_query += '"'+param[i]+'",'
	sql_query += '"'+param[len(columns)-1]+'")'
	print(sql_query)
	try:
		conn.execute(sql_query)
		conn.commit()
	except:
		conn.rollback()
		return "error"
	return "ok"

@app.route('/update', methods=['GET','POST'])
def update():
	param = json.loads(request.form['param'])
	tablename = request.form['tablename']
	conn = get_db()
	result = pd.read_sql_query("select * from "+tablename,conn)
	columns = result.columns.values
	sql_query = 'update '+ tablename + ' set '
	for i in range(len(columns)-2):
		sql_query += columns[i+1] +'="'+param[i+1]+'",'
	sql_query += columns[len(columns)-1] +'="'+param[len(columns)-1]+'"'
	sql_query += ' where ' + columns[0] + '="'+param[0]+'"'
	print(sql_query)
	try:
		conn.execute(sql_query)
		conn.commit()
	except:
		conn.rollback()
		return "error"
	return "ok"

@app.route('/delete', methods=['GET','POST'])
def delete():
	param = json.loads(request.form['param'])
	tablename = request.form['tablename']
	conn = get_db()
	result = pd.read_sql_query("select * from "+tablename,conn)
	columns = result.columns.values
	sql_query = 'delete from '+ tablename + ' where '+columns[0]+'="'+str(param)+'"'
	print(sql_query)
	try:
		conn.execute(sql_query)
		conn.commit()
	except:
		conn.rollback()
		return "error"
	return "ok"ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss