const express = require( 'express' );
const agenda = require( './agenda' );

const app = express();

app.get( '/agenda', ( req, res ) => {
	agenda.createAgenda( req, res, {
		login: req.query.login || process.env.login,
		serverId: req.query.serverId || process.env.serverId || undefined
	} );
} );

app.listen( 4000 );