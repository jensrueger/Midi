import { ControlChange } from './ControlChange'
import { insert } from './BinarySearch'
import { ProgramChange } from './ProgramChange'
// eslint-disable-next-line no-unused-vars
import { Header } from './Header'

/**
 * @private
 * @type {WeakMap<Track, Header>}
 */
const privateHeaderMap = new WeakMap()

/**
 * @typedef MidiEvent
 * @property {string} type
 * @property {number=} velocity
 * @property {number} absoluteTime
 * @property {number=} noteNumber
 * @property {string=} text
 * @property {number=} controllerType
 * @property {number} value
 * @property {number} programNumber
 */

/**
 * @typedef {Array<MidiEvent>} TrackData
 */

/**
 * A Track is a collection of notes, programChanges and controlChanges
 */
export class Track {
	/**
	 * @param {TrackData} trackData
	 * @param {Header} header
	 */
	constructor(trackData, header){
		privateHeaderMap.set(this, header)

		/** @type {string} */
		this.name = ''

		if (trackData){
			const nameEvent = trackData.find(e => e.type === 'trackName')
			this.name = nameEvent ? nameEvent.text : ''
		}

		/** @type {Array<ProgramChange>} */
		this.programChanges = []

		/** @type {Array<ControlChange>} */
		this.controlChanges = []

		/** @type {number} */
		this.channel = 0

		/** @type {Object<string,Array<ControlChange>>} */

		if (trackData){
			const controlChanges = trackData.filter(
				event => event.type === 'controller'
			)
			controlChanges.forEach(event => {
				this.addCC({
					number : event.controllerType,
					value : event.value / 127,
					ticks : event.absoluteTime
				})
			})

			const programChanges = trackData.filter(
				event => event.type === 'programChange'
			)
			programChanges.forEach(event => {
				this.addPC({
					number : event.programNumber,
					ticks : event.absoluteTime
				})
			})
		}
	}

	/**
	 * @typedef CCParameters
	 * @property {number=} time
	 * @property {number=} ticks
	 * @property {number} value
	 * @property {number} number
	 */

	/**
	 * Add a control change to the track
	 * @param {CCParameters} props
	 * @returns {Track} this
	 */
	addCC(props){
		const header = privateHeaderMap.get(this)
		const cc = new ControlChange(
			{
				controllerType : props.number
			},
			header
		)
		delete props.number
		Object.assign(cc, props)
		if (!Array.isArray(this.controlChanges[cc.number])){
			this.controlChanges[cc.number] = []
		}
		insert(this.controlChanges[cc.number], cc, 'ticks')
		return this
	}

	/**
	 * @typedef PCParameters
	 * @property {number=} time
	 * @property {number=} ticks
	 * @property {number} number
	 */

	/**
	 * Add a program change to the track
	 * @param {PCParameters} props
	 * @returns {Track} this
	 */
	addPC(props){
		const header = privateHeaderMap.get(this)
		const pc = new ProgramChange(
			{
				programNumber : props.number
			},
			header
		)
		delete props.number
		Object.assign(pc, props)
		insert(this.programChanges, pc, 'ticks')
		return this
	}

	/**
	 * @param {Object} json
	 */
	fromJSON(json){
		this.name = json.name
		this.channel = json.channel
		for (let number in json.controlChanges){
			json.controlChanges[number].forEach(cc => {
				this.addCC({
					number : cc.number,
					value : cc.value,
					ticks : cc.ticks
				})
			})
		}
	}

	/**
	 * @returns {Object}
	 */
	toJSON(){
		//convert all the CCs to JSON
		const controlChanges = {}
		for (let i = 0; i < 127; i++){
			if (this.controlChanges.hasOwnProperty(i)){
				controlChanges[i] = this.controlChanges[i].map(c => c.toJSON())
			}
		}
		return {
			name : this.name,
			channel : this.channel,
			controlChanges,
			programChanges : this.programChanges
		}
	}
}
