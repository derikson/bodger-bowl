/* @flow */
var React = require('react');
var Reflux = require('reflux');
var Grid = require('react-bootstrap/Grid');
var Navbar = require('react-bootstrap/Navbar');
var NavItem = require('react-bootstrap/NavItem');
var Nav = require('react-bootstrap/Nav');
var ViewStore = require('../stores/view.js');
var SeasonStore = require('../stores/season.js');
var AppActions = require('../actions.js');
var SeasonScheduleContainer = require('./season_schedule_container.js');
var ConferenceContainer = require('./conference_container.js');
var PlayerContainer = require('./player_container.js');

module.exports = React.createClass({
	mixins: [Reflux.ListenerMixin],
	propTypes: {
		admin: React.PropTypes.bool
	},
	getInitialState: function() {
		var selectedPlayer: ?Object = null, season: ?Object = null, activeWeekNumber: ?number = null;
		return {
			season: season,
			activeKey: 1,
			selectedPlayer: selectedPlayer,
			activePlayerTab: 1,
			activeWeekNumber: activeWeekNumber,
		};
	},
	componentDidMount: function() {
		this.listenTo(ViewStore, this.view);
		this.listenTo(SeasonStore, this.onSeasonChange);
	},
	onSeasonChange: function(season: Object) {
		this.setState({
			season: season,
			activeWeekNumber: this.state.activeWeekNumber || 1
		});
	},
	view: function(state: Object) {
		var oldActiveWeekNumber = this.state.activeWeekNumber;
		this.setState({
			activeKey: state.mainTab,
			selectedPlayer: this.getPlayer(state.playerName),
			activePlayerTab: state.playerTab,
			activeWeekNumber: state.weekNumber,
		});
		if (oldActiveWeekNumber != this.state.activeWeekNumber &&
			this.state.activeKey == 1) {
				this.refs.seasonSchedule.scrollToSchedule();
		}
	},
	getPlayer: function(playerName: string): ?Object {
		for (var i = 0; i < this.state.season.Players.length; i++) {
			if (this.state.season.Players[i].Name === playerName) {
				return this.state.season.Players[i];
			}
		}
	},
	render: function(): ?ReactElement {
		var season = this.state.season;
		if(season) {
			var content = <SeasonScheduleContainer ref="seasonSchedule"
				admin={this.props.admin}
				season={season}
				activeWeekNumber={this.state.activeWeekNumber} />;
			if (this.state.activeKey == 2)
				content = <ConferenceContainer admin={this.props.admin} season={season} />;
			if (this.state.activeKey == 3)
				content = <PlayerContainer
					admin={this.props.admin}
					season={season}
					selectedPlayer={this.state.selectedPlayer}
					activeTab={this.state.activePlayerTab} />;
			var brand = <a href="/">Bodger Bowl</a>;
			return (
				<div>
					<Navbar staticTop fluid brand={brand}>
						<Nav>
							<NavItem className={this.state.activeKey == 1 ? "active" : ""}
									eventKey={1}
									onClick={function() { AppActions.viewMainTab(1); }}>
								Season Schedule
							</NavItem>

							<NavItem className={this.state.activeKey == 2 ? "active" : ""}
									eventKey={2}
									onClick={function() { AppActions.viewMainTab(2); }}>
								Conferences
							</NavItem>

							<NavItem className={this.state.activeKey == 3 ? "active" : ""}
									eventKey={3}
									onClick={function() { AppActions.viewMainTab(3); }}>
								Players
							</NavItem>
						</Nav>
						<Nav right>
							<NavItem href="http://sustainedattack.wordpress.com/events/bodger-bowl-iv/">About</NavItem>
						</Nav>
					</Navbar>
					<Grid fluid>
						{content}
					</Grid>
				</div>
			);
		} else {
			return <h1>Loading Season Data</h1>;
		}
	},
});
