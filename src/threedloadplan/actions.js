import * as types from './types';
import response from './response.json';

export const groupsFetched = groups => ({
  type: types.GROUPS_FETCHED,
  groups
});

export const fetchGroups = () => dispatch =>
  setTimeout(() => dispatch(groupsFetched(response)), 1000);

export const awbFilterUpdated = filteredAwb => ({
  type: types.AWB_FILTER_UPDATED,
  filteredAwb
});

export const groupFilterUpdated = filteredGroup => ({
  type: types.GROUP_FILTER_UPDATED,
  filteredGroup
});