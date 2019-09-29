import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import AWBListItem from './AWBListItem';

//import { ITextField } from 'icoreact/lib/ico/framework/html/elements';
//import { wrapForm } from 'icoreact/lib/ico/framework/component/common/form';

// TODO: Use ITextField
const ITextField = props => (
  <input type='text' className='search-icon' {...props} />
);

export default ({
  plannedGroups,
  awbs,
  dimensions,
  filteredAwb,
  filteredGroup,
  awbFilterUpdated,
  groupFilterUpdated
}) => {
  const [isDropDownOpen, setDropDownOpen] = useState(false);
  const toggle = e => {
    setDropDownOpen(!isDropDownOpen);
    groupFilterUpdated(
      e.currentTarget.textContent === 'All'
        ? null
        : e.currentTarget.textContent
    );
  };
  const groupEntries = Object.entries(plannedGroups);
  const awbNumbers = groupEntries.filter(([groupName, _]) =>
    !filteredGroup || filteredGroup === groupName
  ).reduce((acc, [groupName, group]) =>
    acc.concat(group.loadedShipments.filter(awbNumber =>
      !filteredAwb || awbNumber.indexOf(filteredAwb) !== -1
    )), []
  );

  return (
    <div className='awb-list-container'>
      <div className='awb-list-header'>
        <div className='awb-search-container'>
          <span className='awb-count'>{awbNumbers.length}</span>
          <span className='awb-label'>AWBs</span>
          <ITextField onChange={e => awbFilterUpdated(e.target.value)} />
        </div>
        <div className='group-toggle-container'>
          <span className='group-toggle-label'>
            ULD configuration and plan for:
          </span>
          <Dropdown isOpen={isDropDownOpen} toggle={toggle}>
            <DropdownToggle className='group-toggle-content'>
              {filteredGroup || 'All'}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>All</DropdownItem>
              {groupEntries.map(([groupName, _]) =>
                <DropdownItem>{groupName}</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className='awb-list'>
        {awbNumbers.map((awbNumber, key) =>
          <AWBListItem
            awb={awbs[awbNumber]}
            key={'' + key}
            index={key}
            dimensions={dimensions}
        />)}
      </div>
    </div>
  );
};