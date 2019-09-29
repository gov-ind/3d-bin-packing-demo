import React from 'react';

export default ({
  awb: {
    shipmentPrefix,
    masterDocumentNumber,
    items,
    sccs
  },
  dimensions
}) => 
  <div className='awb-item'>
    <div className='awb-item-top'>
      <div className='awb-number-wrapper'>
        <b className='awb-number'>{shipmentPrefix + '-' + masterDocumentNumber}</b>
        <div className='awb-scc'>
          {sccs && Array.isArray(sccs) && sccs.length > 0 && sccs[0]}
        </div>
      </div>
      <div className='awb-item-header-container'>
        <b className='position-container'>POS</b>
        <b className='dimension-container'>L x B x H (cm)</b>
        <b className='loaded-container'>Loaded</b>
      </div>
    </div>
    {items && items.map(item => {
      const dimension = dimensions[item];
      const {
        plannedPieces,
        plannedWeight,
        plannedVolume,
        length,
        breadth,
        height,
        position
      } = dimension;

      return (
        <div className='dimension-wrapper'>
          <span className='dimension-details-wrapper'>
            {plannedPieces} pcs |
            {'  '}{plannedWeight.displayValue + ' ' + plannedWeight.displayUnit} |
            {'  '}{plannedVolume.displayValue.toFixed(2) + ' ' + plannedVolume.displayUnit}
          </span>
          <div className='awb-item-header-container'>
            <span className='position-container'>{position}</span>
            <span className='dimension-container'>{length} x {breadth} x {height}</span>
            <span className='loaded-container'>
              <input type='checkbox' className='margin-right' />
            </span>
          </div>
        </div>
      )
    })}
  </div>