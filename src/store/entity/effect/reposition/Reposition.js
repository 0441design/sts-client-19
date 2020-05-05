// Reposition.js
// store/entity/effect/reposition


import _ from 'lodash'

//import {forces} from '../../../services/forces'
import Effect from '../Effect.js'


function Reposition (id, opts = {}) {
	if(!opts.reference) throw new Error('Missing Place reference in reposition')
	if(!opts.coords) throw new Error('Missing Place coords in reposition')
	if(!opts.display) throw new Error('Missing display in reposition')
	if(!opts.serial) throw new Error('Missing display serial in reposition')
	Effect.call(this, id, {
		scale: 0,
		instant: true
	})
	this.value = 'Reposition'
	this.tag = 'Reposition Effect'
	this.name = 'reposition'

	this.newPosition = _.set({}, opts.reference, opts.coords)
	this.display = opts.display
	this.serial = opts.serial

}

Reposition.prototype = Object.create(Effect.prototype)


export {Reposition}