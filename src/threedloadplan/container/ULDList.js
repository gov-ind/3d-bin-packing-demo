import { connect } from 'react-redux';

import ULDList from '../panel/ULDList';

const mapStateToProps = state => ({
  plannedGroups: state.threedLoadPlan.plannedGroups,
  ulds: state.threedLoadPlan.ulds,
  dimensions: state.threedLoadPlan.dimensions,
  filteredGroup: state.threedLoadPlan.filteredGroup
});

export default connect(mapStateToProps)(ULDList);