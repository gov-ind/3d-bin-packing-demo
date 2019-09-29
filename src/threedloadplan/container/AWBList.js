import AWBList from '../panel/AWBList';
import { connect } from 'react-redux';

import { groupFilterUpdated, awbFilterUpdated } from '../actions';

const mapStateToProps = state => ({
  plannedGroups: state.threedLoadPlan.plannedGroups,
  awbs: state.threedLoadPlan.awbs,
  dimensions: state.threedLoadPlan.dimensions,
  filteredAwb: state.threedLoadPlan.filteredAwb,
  filteredGroup: state.threedLoadPlan.filteredGroup
});

const mapDispatchToProps = dispatch => ({
  groupFilterUpdated: _ => dispatch(groupFilterUpdated(_)),
  awbFilterUpdated: _ => dispatch(awbFilterUpdated(_))
})

export default connect(mapStateToProps, mapDispatchToProps)(AWBList);