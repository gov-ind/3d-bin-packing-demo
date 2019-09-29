import React from 'react';

import ULDListItem from './ULDListItem';

const getFilteredULDNumbers = (plannedGroups, filteredGroup) =>
  Object.entries(plannedGroups).filter(([groupName, _]) =>
    !filteredGroup || filteredGroup === groupName
  ).reduce((acc, [_, group]) =>
    acc.concat(group.loadedULDPositions),
  []);

export default ({ plannedGroups, ulds, dimensions, filteredGroup }) =>
  <div className='uld-list-wrapper'>
    <div className='uld-list-container'>
      {getFilteredULDNumbers(plannedGroups, filteredGroup)
      .map(uldNumber => {
        const uld = ulds[uldNumber];

        return (
          <div className='uld-item-container'>
            <ULDListItem uld={uld} dimensions={dimensions} />
            <span className='uld-occupancy'>
              {uld.occupancy} %
            </span>
            <div className='uld-item-details'>
              <div className='uld-item-details-row'>
                <b>{uldNumber}</b>
                <b>L x B x H ({uld.baseDimLength.displayUnit})</b>
              </div>
              <div className='uld-item-details-row-2'>
                <span>
                  {uld.uldStructuralWeight.displayValue} {uld.uldStructuralWeight.displayUnit}
                </span>
                <span>
                  {uld.baseDimLength.displayValue}{' '}x{' '}
                  {uld.baseDimWidth.displayValue}{' '}x{' '}
                  {uld.baseDimHeight.displayValue}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>