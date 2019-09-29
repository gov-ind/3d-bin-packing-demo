import * as types from './types';

const initialState = {
  plannedGroups: {},
  ulds: {},
  awbs: {},
  dimensions: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.GROUPS_FETCHED:
      return action.groups;
    case types.AWB_FILTER_UPDATED:
      const { filteredAwb } = action;
      return {...state, filteredAwb};
    case types.GROUP_FILTER_UPDATED:
      const { filteredGroup } = action;
      return {...state, filteredGroup};
    default:
      return state;
  }
};