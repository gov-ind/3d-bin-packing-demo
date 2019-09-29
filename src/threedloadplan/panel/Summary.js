import React, { useEffect } from 'react';
import { Progress } from 'reactstrap';

export default ({
  flightCarrierCode = '',
  flightNumber = '',
  flightDate = '',
  flightRoute = [],
  sccs = [],
  pendingAWBCount,
  totalPendingPieces,
  loadedULDCount,
  // totalUlds,
  uldPositions = [],
  totalPendingWeight = {},
  totalPendingVolume = {},
  flightOccupancy,
  fetchGroups
}) => {
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className='animated fadeInDown iw-100 higlight-border summary-background summary-container'>
      <div className='flight-details-container'>
        <div className='flight-details no-margin'>
          <span className='flight-number'>
              {flightCarrierCode + flightNumber}
          </span>            
          <div className='segments'>
            {flightRoute.map((route, i) => (
              <span key={'' + i} className='segment'>
                {route}
                {i !== flightRoute.length - 1
                  ? <div className='flight-icon'></div>
                  : null}
              </span>
            ))}
          </div>
        </div>
        <div className='flight-routes-container'>             
          <span className='flight-date'>
              {flightDate}
          </span>
          <div className='segments-container'>
            {sccs.filter((_, i) => i < 4).map((scc, i) =>
              <span
                key={'' + i}
                className={'scc' +
                  (scc === 'DGD' ? ' dangerous-scc' : '') +
                  (scc === 'PER' ? ' perishable-scc' : '')}>
                {scc}
              </span>
            )}
            {sccs.length >= 4 && <span className='extra-scc'>+{sccs.length - 4}</span>}
          </div>
        </div>
      </div>
      <div className='awb-details-container'>
        <div className='pending-container'>
          <span>Pending</span>
          <div className='available-shipments-checkbox-container'>
            <input type='checkbox' className='margin-right'></input>
            <span>Show only available shipments</span>
          </div>
        </div>
        <div className='awb-details'>
          <span className='light-container'>
            <span className='light'>{pendingAWBCount}</span>
            AWBs
          </span>
          <span className='light-container'>
            <span className='light'>{totalPendingPieces}</span>
            pieces
          </span>
          <span className='light-container'>
            <span className='light'>
              {totalPendingWeight.displayValue} 
            </span>
            {totalPendingWeight.displayUnit} {/*TODO: Unit*/}
          </span>
          <span className='light-container'>
            <span className='light'>
              {totalPendingVolume.displayValue} 
            </span>
            {totalPendingVolume.displayUnit}
          </span>
        </div>
      </div>
      <div className='uld-details-container'>
        <div className='loaded-ulds-container'>
          <div>Loaded ULDs</div>
          <span>
            <span style={{ color: '#616161' }}>
              {loadedULDCount}
            </span>
            {' / ' + /* TODO: totalUlds */ 12} ULDs
          </span>
        </div>
        <div className='uld-positions-wrapper'>
          <span>ULD positions</span>
          <span className='uld-positions'>
            {uldPositions.map(uldPosition => 
              <span className='uld-position-item'>
                {uldPosition}
              </span>
            )}
          </span>
        </div>
        <div className='flight-occupancy-container'>
          <span>Flight Occupancy</span>
          <span className='progress-container'>
            <span className='flight-occupancy'>{flightOccupancy} %</span>
            <Progress
              className='flight-progress'
              color='warning'
              value={flightOccupancy}
            />
          </span>
        </div>
      </div>
    </div>
  );
}