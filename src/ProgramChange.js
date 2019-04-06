import { Header } from './Header'

/**
 * @private
 * @type {WeakMap<ProgramChange, Header>}
 */
const privateHeaderMap = new WeakMap()

/**
 * @private
 * @type {WeakMap<ProgramChange, number>}
 */
const privatePCNumberMap = new WeakMap()

/**
 * @typedef ProgramChangeEvent
 * @property {number} programNumber
 * @property {number=} absoluteTime
 */

/**
 * Represents a control change event
 */
export class ProgramChange {
	/**
	 * @param {ProgramChangeEvent} event
	 * @param {Header} header
	 */
	constructor(event, header){
		privateHeaderMap.set(this, header)

		/** @type {number} */
		this.ticks = event.absoluteTime

		/** @type {number} */
		this.number = event.programNumber
	}

	/**
	 * The controller number
	 * @readonly
	 * @type {number}
	 */
	// get number(){
	// 	return privatePCNumberMap.get(this)
	// }

	/**
	 * The time of the event in seconds
	 * @type {number}
	 */
	get time(){
		const header = privateHeaderMap.get(this)
		return header.ticksToSeconds(this.ticks)
	}

	set time(t){
		const header = privateHeaderMap.get(this)
		this.ticks = header.secondsToTicks(t)
	}

	toJSON(){
		return {
			number : this.number,
			time : this.time,
			ticks : this.ticks
		}
	}
}
