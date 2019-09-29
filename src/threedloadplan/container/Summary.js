import { connect } from 'react-redux';

import Summary from '../panel/Summary';
import { fetchGroups } from '../actions';

const mapStateToProps = state => ({
  flightCarrierCode: state.threedLoadPlan.flightCarrierCode,
  flightNumber: state.threedLoadPlan.flightNumber,
  flightDate: state.threedLoadPlan.flightDate,
  flightRoute: state.threedLoadPlan.flightRoute,
  sccs: state.threedLoadPlan.sccs,
  pendingAWBCount: state.threedLoadPlan.pendingAWBCount,
  totalPendingPieces: state.threedLoadPlan.totalPendingPieces,
  loadedULDCount: state.threedLoadPlan.loadedULDCount,
  uldPositions: state.threedLoadPlan.uldPositions,
  totalPendingWeight: state.threedLoadPlan.totalPendingWeight,
  totalPendingVolume: state.threedLoadPlan.totalPendingVolume,
  flightOccupancy: state.threedLoadPlan.flightOccupancy,
});

const mapDispatchToProps = dispatch => ({
  fetchGroups: () => dispatch(fetchGroups())
});

export default connect(mapStateToProps, mapDispatchToProps)(Summary);
