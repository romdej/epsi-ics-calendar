const request = require( 'request-promise' );
const ics = require( 'ics' );
const moment = require('moment-timezone');
const HTMLParser = require( 'node-html-parser' );


const readPlanning = ( login, serverId, date = now() ) => {

	if ( ! moment( date ).isValid() ) {
		return new Promise( ( resolve, reject ) => {
			reject( 'Date is invalid' )
		} );
	}

	return request.get( {
		url: `http://edtmobilite.wigorservices.net/WebPsDyn.aspx?Action=posETUDSEM&serverid=${serverId}&tel=${login}&date=${moment( date ).format( 'MM/DD/YYYY' )}`,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36'
		},
	} )
};

const parsePlanning = ( source ) => {
	const html = HTMLParser.parse( source );

	// Get day labels
	const days = html.querySelectorAll( '.TCJour' ).map( element => element.innerHTML );

	// Get position for each day's column
	const positions = html.querySelectorAll( '.BJour' ).map( element => {
		return parseFloat( element.rawAttrs.split( ';' ).filter( attribute => attribute.startsWith( 'left:' ) )[0].split( ':' )[1] );
	} );


	return events = html.querySelectorAll( '.Case' ).map( element => {
		const position = parseFloat( element.rawAttrs.split( ';' ).filter( attribute => attribute.startsWith( 'left:' ) )[0].split( ':' )[1] );

		const dayPos = positions.find( ( val, index ) => (
			val === position || positions.length === index - 1 || (
				position > val && position < positions[index + 1]
			)
		) );

		const day = days[positions.indexOf( dayPos )];
		const hours = element.querySelector( '.TChdeb' ).innerHTML.split( ' - ' );

		const event = {
			start: moment.tz( `${day} ${hours[0]}`, 'Europe/Paris' ).format( 'YYYY-M-D-H-m' ).split( "-" ),
			end: moment.tz( `${day} ${hours[1]}`, 'Europe/Paris' ).format( 'YYYY-M-D-H-m' ).split( "-" ),
			title: element.querySelector( '.TCase' ).querySelector( '.TCase' ).innerHTML,
			description: element.querySelector( '.TCProf' ).innerHTML.replace( /<br ?\/?>/g, '\n' ),
			location: element.querySelector( '.TCSalle' ).innerHTML
		};

		return event;
	} );
};

const convertEventsToICS = ( events ) => (
	new Promise( ( resolve, reject ) => {
		const {error, value: planning} = ics.createEvents( events );
		if ( error ) {
			reject( error );
		}
		resolve( planning );
	} )
);

module.exports.createAgenda = async ( req, res, options = {} ) => {
	const {login, serverId = "i"} = options;

	console.log(serverId);

	if ( ! login ) {
		res.end( 'You should provide login' );
		return;
	}

	const events = [];

	const date = new Date();
	date.setDate( date.getDate() - 196 );

	for ( let i = 0; i <= 54; i ++ ) {
		date.setDate( date.getDate() + 7 );
		const source = await readPlanning( login, serverId, date );
		const week = await parsePlanning( source );
		if ( week.length ) {
			events.push( ...week );
		}
	}

	const planning = await convertEventsToICS( events );
	console.log( planning );
	res.set( 'Content-Type', 'text/calendar; charset=utf-8' );
	res.set( 'Content-Disposition', 'attachment; filename=calendar.ics' );
	res.send( planning );
};

