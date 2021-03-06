﻿var mongo = require( 'mongodb' );



function MongoHelper( servername, port, databaseName, collectionName, username, password ) {
    this.colName = collectionName;
    this.dbName = databaseName;
    this.svrName = servername;
    this.svrPort = port;
    this.findAll = findAll;
    this.findById = findById;
    this.openDb = openDb;
    this.username = username;
    this.password = password;



}

module.exports = MongoHelper;

function openDb( seedData, callback ) {
    console.log('seed data ' + JSON.stringify(seedData));
    console.log( 'open db ' + this.dbName );
    var self = this;
    var Server = mongo.Server,
        Db = mongo.Db;

    var server = new Server( self.svrName, this.svrPort, { auto_reconnect: true });
    var db = new Db( self.dbName, server );



    db.open( function ( err, db ) {

        if(self.username){
                db.authenticate( self.username, self.password, function ( err, success ) {
                    if ( !err ) {
                        console.log( "Connected to " + self.dbName + " database" );
                        seedCollection( seedData, self.colName, callback, db );

                    }
                    else {
                        console.log( JSON.stringify( err ) );
                        throw err;
                    }
                });
        }
        else
            {
                console.log( "Connected to " + self.dbName + " database" );
                seedCollection( seedData, self.colName, callback, db );
            }


    });
};

function seedCollection( data, colName, callback, db ) {
    var self = this;
    console.log( 'collection=' + colName );
    db.collection( colName, { strict: true }, function ( err, collection ) {
        if ( err ) {
            console.log( err + "..The " + colName + " collection doesn't exist. Seeding..." );
            db.collection( colName, function ( err, collection ) {
                
                collection.insert( data, { safe: true }, function ( err, result ) { 
                    if(err) console.log(err);

                    if(callback) callback( db );
                     });
            });
        }
        else {
           if(callback)  callback( db );
        }

    });

}

function findAll( callback ) {
    var self = this;
    this.openDb( [], function ( db ) {

        db.collection( self.colName, function ( err, collection ) {
            if ( err ) {
                console.log( err );
                throw err;
            }
            else {
                collection.find().toArray( function ( err, items ) {

                    callback( err, items );
                });
            }
        });
    });

}

function findById( id, callback ) {
    var self = this;
    var BSON = mongo.BSONPure;
    this.openDb( [], function ( db ) {

        console.log( 'Retrieving id: ' + id );
        db.collection( self.colName, function ( err, collection ) {
            collection.findOne( { '_id': new BSON.ObjectID( id ) }, function ( err, item ) {
                callback( err, item );
            });
        });
    });
};






