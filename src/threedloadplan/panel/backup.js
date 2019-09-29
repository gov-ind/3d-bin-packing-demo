import React, { useEffect, useState, Fragment } from 'react';
import * as THREE from 'three/src/Three';
import { Canvas, extend, useThree } from 'react-three-fiber';
import OrbitControls from 'three-orbitcontrols';

import d from './data.json';
import shape from '../shape.json';

extend({ OrbitControls });

const camera = {
  position: new THREE.Vector3(0, 0, 250)
};
const style = {
  width: 800,
  height: 800
};
const plain = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('images/crate.png')
});
const untiltable = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('images/crate_untiltable.png')
});
const unstackable = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('images/crate_unstackable.png')
});

let numberOfHeaviestItemsToPackFromCenter = 15;

const getCornerCoordOfItemInBin = (bin, item) => ({
  x: bin.cornerCoord.x + item.l / 2,
  y: bin.cornerCoord.y + item.b / 2,
  z: bin.cornerCoord.z + item.h / 2
});

const splitBinByLength = (bin, item) => ({
  x: item.l / 2,
  y: 0,
  z: 0,
  l: bin.l - item.l,
  b: bin.b,
  h: bin.h,
  color: '#CECECE',
  cornerCoord: {
    x: bin.cornerCoord.x + item.l,
    y: bin.cornerCoord.y,
    z: bin.cornerCoord.z
  },
  type: 'l',
  reservedForHeavyItems: bin.reservedForHeavyItems
});

const splitBinByHeight = (bin, item) => ({
  x: -bin.l / 2 + item.l / 2,
  y: 0,
  z: item.h / 2,
  l: item.l,
  b: bin.b,
  h: bin.h - item.h,
  color: '#000',
  cornerCoord: {
    x: bin.cornerCoord.x,
    y: bin.cornerCoord.y,
    z: bin.cornerCoord.z + item.h
  },
  type: 'h',
  reservedForHeavyItems: bin.reservedForHeavyItems
});

const splitBinByBreadth = (bin, item) => ({
  x: -bin.l / 2 + item.l / 2,
  y: item.b / 2,
  z: -bin.h / 2 + item.h / 2,
  l: item.l,
  b: bin.b - item.b,
  h: item.h,
  color: '#000',
  cornerCoord: {
    x: bin.cornerCoord.x,
    y: bin.cornerCoord.y + item.b,
    z: bin.cornerCoord.z
  },
  type: 'b',
  reservedForHeavyItems: bin.reservedForHeavyItems
});

const createSubBins = (bin, item) =>
  [
    splitBinByLength(bin, item),
    splitBinByHeight(bin, item),
    splitBinByBreadth(bin, item)
  ];

const theBin = {
  l: 244,
  b: 163,
  h: 163,
  cornerCoord: {
    x: -244 / 2,
    y: -163 / 2,
    z: -163 / 2
  }
};

const binsForHeaviestFromMiddle = [{ // left
    x: -244 / 2 + 80 / 2,
    y: 0,
    z: 0,
    l: 80,
    b: 163,
    h: 163,
    cornerCoord: {
      x: -244 / 2,
      y: -163 / 2,
      z: -163 / 2
    },
    color: 'red'
  }, { // middle
    x: 0,
    y: 0,
    z: 0,
    l: 84,
    b: 163,
    h: 83,
    cornerCoord: {
      x: -244 / 2 + 80,
      y: -163 / 2,
      z: -163 / 2 + 40
    },
    color: 'red',
    reservedForHeavyItems: true
  }, { // right
    x: -244 / 2 + 80 / 2 + 80 + 84,
    y: 0,
    z: 0,
    l: 80,
    b: 163,
    h: 163,
    cornerCoord: {
      x: -244 / 2 + 80 + 84,
      y: -163 / 2,
      z: -163 / 2
    },
    color: 'red'
  }, { // back
    x: 0,
    y: 0,
    z: -163 / 2 + 40 / 2,
    l: 84,
    b: 163,
    h: 40,
    cornerCoord: {
      x: -244 / 2 + 80,
      y: -163 / 2,
      z: -163 / 2
    },
    color: 'red'
  }, { // front
    x: 0,
    y: 0,
    z: 163 / 2 - 40 / 2,
    l: 84,
    b: 163,
    h: 40,
    cornerCoord: {
      x: -244 / 2 + 80,
      y: -163 / 2,
      z: -163 / 2 + 40 + 83
    },
    color: 'red'
  }];

const createInitialBins = strategy => {
  if (strategy === 1) { // heaviest from middle
    return binsForHeaviestFromMiddle;
  }
  else {
    numberOfHeaviestItemsToPackFromCenter = -1;
    return [{
      l: 244,
      b: 163,
      h: 163,
      cornerCoord: {
        x: -244 / 2,
        y: -163 / 2,
        z: -163 / 2
      }
    }];
  }
};

let bins = createInitialBins(0);
window.bins = bins;

let items = [{
  l: 40,
  b: 45,
  h: 46
}];

const spinItem = (item, axis = 1) => {
  let tmp, tmp2;

  unspinItem(item);

  if (axis === 1) {
    tmp = item.l;
    item.l = item.b;
    item.b = tmp;
  }
  else if (axis === 2) {
    tmp = item.b;
    item.b = item.h;
    item.h = tmp;
  }
  else if (axis === 3) {
    tmp = item.l;
    item.l = item.h;
    item.h = tmp;
  }
  else if (axis === 4) {
    tmp = item.l;
    item.l = item.b;
    item.b = tmp;

    tmp2 = item.h;
    item.h = item.l;
    item.l = tmp2;
  }
  else if (axis === 5) {
    tmp = item.l;
    item.l = item.b;
    item.b = tmp;

    tmp2 = item.h;
    item.h = item.b;
    item.b = tmp2;
  }

  item.axis = axis;
};

//spinItem()

const unspinItem = item => {
  let tmp, tmp2;

  if (item.axis === 1) {
    tmp = item.l;
    item.l = item.b;
    item.b = tmp;
  }
  else if (item.axis === 2) {
    tmp = item.b;
    item.b = item.h;
    item.h = tmp;
  }
  else if (item.axis === 3) {
    tmp = item.l;
    item.l = item.h;
    item.h = tmp;
  }
  else if (item.axis === 4) {
    tmp2 = item.h;
    item.h = item.l;
    item.l = tmp2;

    tmp = item.l;
    item.l = item.b;
    item.b = tmp;
  }
  else if (item.axis === 5) {
    tmp2 = item.h;
    item.h = item.b;
    item.b = tmp2;

    
    tmp = item.l;
    item.l = item.b;
    item.b = tmp;
  }

  item.axis = 0;
};

const doesItemFitInBin = (bin, item) =>
  item.l <= bin.l && item.b <= bin.b && item.h <= bin.h;

const pack = items => {
  bins = createInitialBins(0);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const candidateHBins = [];
    const candidateBBins = [];

    for (let j = 0; j < bins.length; j++) {
      const bin = bins[j];
      
      if (item.packed) break;
      if (!bin) continue;

      if (numberOfHeaviestItemsToPackFromCenter !== -1) {
        if (
          i <= numberOfHeaviestItemsToPackFromCenter &&
          //!items.filter(_ => !_.packed && _.heavy).length === 0 ||
          (bin.reservedForHeavyItems && !item.heavy) ||
          (!bin.reservedForHeavyItems && item.heavy)
        ) continue;
      }


      console.log('Attempt to fit item ' + item.id + ' into bin ' + j + ' ' + bin.type);

      if (doesItemFitInBin(bin, item)) {
        console.log('succeeded');
        //packItem(bin, j, item);
        if (isFirstFit(bin)) {
          packItem(bin, j, item);
          break;
        }
        if (bin.type === 'h') {
          candidateHBins.push({ bin, index: j, spin: 0 });
        }
        else {
          candidateBBins.push({ bin, index: j, spin: 0 });
        }
      }
      else if (item.spinnable) {
        console.log('failed, trying with spin 1');
        spinItem(item, 1);

        if (doesItemFitInBin(bin, item)) {
          console.log('succeeded');
          //packItem(bin, j, item);
          if (isFirstFit(bin)) {
            packItem(bin, j, item);
            break;
          }
          if (bin.type === 'h') {
            candidateHBins.push({ bin, index: j, spin: 1 });
          }
          else {
            candidateBBins.push({ bin, index: j, spin: 1 });
          }
        }
        //else {
          console.log('failed, trying with spin 2');
          spinItem(item, 2);

          if (doesItemFitInBin(bin, item)) {
            console.log('succeeded');
            //packItem(bin, j, item);
            if (isFirstFit(bin)) {
              packItem(bin, j, item);
              break;
            }
            if (bin.type === 'h') {
              candidateHBins.push({ bin, index: j, spin: 2 });
            }
            else {
              candidateBBins.push({ bin, index: j, spin: 2 });
            }
          }
          //else {
            console.log('failed, trying with spin 3');
            spinItem(item, 3);

            if (doesItemFitInBin(bin, item)) {
              console.log('succeeded');
              //packItem(bin, j, item);
              if (isFirstFit(bin)) {
                packItem(bin, j, item);
                break;
              }
              if (bin.type === 'h') {
                candidateHBins.push({ bin, index: j, spin: 3 });
              }
              else {
                candidateBBins.push({ bin, index: j, spin: 3 });
              }
            }
            //else {
              console.log('failed, trying with spin 5');
              spinItem(item, 4);

              if (doesItemFitInBin(bin, item)) {
                console.log('succeeded');
                //packItem(bin, j, item);
                if (isFirstFit(bin)) {
                  packItem(bin, j, item);
                  break;
                }
                if (bin.type === 'h') {
                  candidateHBins.push({ bin, index: j, spin: 4 });
                }
                else {
                  candidateBBins.push({ bin, index: j, spin: 4 });
                }
              }
              //else {
                console.log('failed, trying with spin 5');
                spinItem(item, 5);
  
                if (doesItemFitInBin(bin, item)) {
                  console.log('succeeded');
                  //packItem(bin, j, item);
                  if (isFirstFit(bin)) {
                    packItem(bin, j, item);
                    break;
                  }
                  if (bin.type === 'h') {
                    candidateHBins.push({ bin, index: j, spin: 5 });
                  }
                  else {
                    candidateBBins.push({ bin, index: j, spin: 5 });
                  }
                }
              //}
            //}
          //}
        //}
      }
      unspinItem(item);
    }

    //debugger;
    
    //if (item.id === 24)
    //debugger;

    if (!item.packed) {debugger;
      if (candidateHBins.length > 0) {
        const { optimalBinIndex, optimalSpin } = getOptimalHBin(candidateHBins, item);

        spinItem(item, optimalSpin);
        packItem(bins[optimalBinIndex], optimalBinIndex, item);
      }
      else if (candidateBBins.length > 0) {
        const { optimalBinIndex, optimalSpin } = getOptimalBBin(candidateBBins, item);

        spinItem(item, optimalSpin);
        packItem(bins[optimalBinIndex], optimalBinIndex, item);
      }
    }
  }

  bins = filterAndSortBins(bins);
  window.bins = bins;

  return {
    bins,
    items
  };
};

const isFirstFit = bin => {
  //return true;
  return bin.type === 'l'
};

const getOptimalHBin = (binIndices, item) => {
  let optimalBinIndex = binIndices[0].index;
  let optimalSpin = binIndices[0].spin;

  binIndices.map(({ index, spin }) => {
    const targetBin = bins[index];
    const optimalBin = bins[optimalBinIndex];
    let targetBinFreeVolume, optimalBinFreeVolume;

    if (targetBin.type === 'h') {
      targetBinFreeVolume = (targetBin.l - item.l) * item.h * item.b;
    }

    if (optimalBin.type === 'h') {
      optimalBinFreeVolume = (optimalBin.l - item.l) * item.h * item.b;
    }

    /*if (targetBin.type === 'h') {
      if (optimalBin.type === 'h' && targetBinFreeVolume < ((optimalBin.l - optimalBin.l) * optimalBin.h * optimalBin.b)) {
        optimalBinIndex = index;
      }
      else if (optimalBin.type === 'b' && ((targetBin.l - item.l) * item.h * item.b) < ((optimalBin.l - optimalBin.l) * optimalBin.h * optimalBin.b))
    }*/
    if (targetBinFreeVolume < optimalBinFreeVolume) {
      optimalBinIndex = index;
      optimalSpin = spin;
    }
    /*else if (targetBin.type === 'b' && (targetBin.l + targetBin.h) < (optimalBin.l + optimalBin.h)) {
      optimalBinIndex = index;
    }*/
  });

  return { optimalBinIndex, optimalSpin };
};

const getOptimalBBin = (binIndices, item) => {
  let optimalBinIndex = binIndices[0].index;
  let optimalSpin = binIndices[0].spin;

  binIndices.map(({ index, spin }) => {
    const targetBin = bins[index];
    const optimalBin = bins[optimalBinIndex];
    let targetBinFreeVolume, optimalBinFreeVolume;

    if (targetBin.type === 'b') {
      targetBinFreeVolume = ((targetBin.l - item.l) * item.h * item.b) + (item.l * (targetBin.h - item.h) * item.b);
    }

    if (targetBin.type === 'b') {
      optimalBinFreeVolume = ((optimalBin.l - item.l) * item.h * item.b) + (item.l * (optimalBin.h - item.h) * item.b);
    }

    /*if (targetBin.type === 'h') {
      if (optimalBin.type === 'h' && targetBinFreeVolume < ((optimalBin.l - optimalBin.l) * optimalBin.h * optimalBin.b)) {
        optimalBinIndex = index;
      }
      else if (optimalBin.type === 'b' && ((targetBin.l - item.l) * item.h * item.b) < ((optimalBin.l - optimalBin.l) * optimalBin.h * optimalBin.b))
    }*/
    if (targetBinFreeVolume < optimalBinFreeVolume) {
      optimalBinIndex = index;
      optimalSpin = spin;
    }
    /*else if (targetBin.type === 'b' && (targetBin.l + targetBin.h) < (optimalBin.l + optimalBin.h)) {
      optimalBinIndex = index;
    }*/
  });

  return { optimalBinIndex, optimalSpin };
};

const packItem = (bin, binIndex, item) => {
  const _  = getCornerCoordOfItemInBin(bin, item);

  bins.push(...createSubBins(bin, item));
  bins[binIndex] = null;

  item.x = _.x;
  item.y = _.y;
  item.z = _.z;
  item.packed = true;
};

const filterAndSortBins = bins =>
  bins
  .filter(bin => bin && bin.l !== 0 && bin.b !== 0 && bin.h !== 0)
  .sort((a, b) => {
    if (a.type === 'h') return -1;
    if (a.type === 'b') {
      if (b.type === 'l') return -1;
      return 1;
    }
    if (a.type === 'l') return 1;
  });

const sortItemsByVolume = items => items.sort((a, b) => {
  if (a.unstackable && !b.unstackable)
    return 1;
  if (b.unstackable && !a.unstackable)
    return -1;
  if ((a.l * a.b * a.h) > (b.l * b.b * b.h))
    return -1
  return 1;
});

const putNHeaviestItemsFirst = (items, n = numberOfHeaviestItemsToPackFromCenter) => {
  if (numberOfHeaviestItemsToPackFromCenter === -1) return items;

  const copy = items.map((item, index) => ({ item, index }));

  // TODO: handle heaviest but not stackable
  copy.sort((a, b) => {
    if (a.item.unstackable) {
      return 1;
    }
    if (a.item.weight > b.item.weight)
      return -1;
    return 1;
  });

  for (let i = 0; i < n; i++) {
    items[copy[i].index] = null;
  }

  return copy.map(_ => ({ ..._.item, heavy: true })).slice(0, n).concat(items.filter(_ => _));
};

const ULDScene = ({ uld, dimensions, items = [], subBins }) => {
  const { camera, gl } = useThree();

  /*const item = {
    x: -244 / 2,
    y: -163 / 2,
    z: -163 / 2,
    l: 40,
    b: 10,
    h: 60
  };

  spinItem(item, 5);
  unspinItem(item);

  const material = item.myRotationConstraints === 7
          ? untiltable
          : item.myPositionConstraints === 2
            ? unstackable
            : plain;*/

  return (
    <Fragment>
      <orbitControls args={[camera, gl.domElement]} enableDamping />
      <group>
        {uld.contour.faces.map(face =>
          <line>
            <geometry
              attach='geometry'
              vertices={face.points.map(point => new THREE.Vector3(point.x, point.y, point.z))}
            />
            <lineBasicMaterial attach='material' color='#8A8A8A' />
          </line>)}
      </group>
      {(subBins || []).map(subBin => {
        return (
          <mesh position={[subBin.x + subBin.cornerCoord.x, subBin.y, subBin]} color='#CECECE'>         
            <boxBufferGeometry
              attach='geometry'
              args={[subBin.l, subBin.b, subBin.h]}
            />
          </mesh>
        );
      })}
      {items.map(item => {
        const material = item.myRotationConstraints === 7
          ? untiltable
          : item.myPositionConstraints === 2
            ? unstackable
            : plain;

        return (
          <mesh
            position={[item.x, item.y, item.z]}
            material={material}
            onClick={e => alert(item.id)}
          >         
            <boxBufferGeometry
              attach='geometry'
              args={[item.l, item.b, item.h]}
            />
            {item.heavy && <meshBasicMaterial attach='material' color='red' />}
            {item.unstackable && <meshBasicMaterial attach='material' color='blue' />}
          </mesh>
        );
      })}
    </Fragment>
  );
};

items = pack(items).items;

/*let newItems = [
  {"id":12,"l":40,"b":37,"h":38,"weight":17.512055393515897},
  {"id":96,"l":36,"b":38,"h":39,"weight":26.703374934395853, unstackable: true},
  {"id":21,"l":36,"b":37,"h":39,"weight":22.691877999126895, unstackable: true},
  {"id":35,"l":32,"b":39,"h":38,"weight":7.076429841596443, unstackable: true},
  {"id":7,"l":32,"b":37,"h":37,"weight":25.01681973005458, unstackable: true},
  {"id":66,"l":37,"b":32,"h":37,"weight":16.93326049314387, unstackable: true},
  {"id":6,"l":25,"b":21,"h":21,"weight":12.980079999287524, unstackable: true},
  {"id":60,"l":27,"b":21,"h":22,"weight":13.71305998672768, unstackable: true},
  {"id":41,"l":27,"b":23,"h":21,"weight":19.971004273977485, unstackable: true},
  {"id":45,"l":27,"b":24,"h":22,"weight":15.690667821632571, unstackable: true},
  {"id":8,"l":27,"b":21,"h":26,"weight":3.741435966054032, unstackable: true},{"id":61,"l":23,"b":26,"h":25,"weight":18.571232311441438},{"id":89,"l":21,"b":35,"h":21,"weight":3.8835760272165976},{"id":39,"l":21,"b":24,"h":31,"weight":18.14821319246191},{"id":11,"l":26,"b":28,"h":23,"weight":5.91564583675988},{"id":38,"l":27,"b":21,"h":30,"weight":14.592157825059067},{"id":50,"l":21,"b":22,"h":38,"weight":29.715900582492797,"heavy":true},{"id":69,"l":32,"b":24,"h":23,"weight":17.12318864349656},{"id":64,"l":31,"b":25,"h":23,"weight":28.424008716024396,"heavy":true},{"id":5,"l":21,"b":25,"h":34,"weight":25.969313393902155},{"id":27,"l":36,"b":21,"h":24,"weight":20.262957384215298},{"id":90,"l":23,"b":21,"h":38,"weight":18.55234432630118},{"id":92,"l":22,"b":28,"h":30,"weight":9.171915053595391},{"id":47,"l":30,"b":22,"h":28,"weight":16.697730285722074},{"id":58,"l":22,"b":39,"h":22,"weight":13.47099258257317},{"id":73,"l":23,"b":38,"h":22,"weight":4.038086801856224},{"id":19,"l":25,"b":35,"h":22,"weight":14.474375699587071},{"id":63,"l":28,"b":28,"h":25,"weight":23.184998954408425},{"id":18,"l":28,"b":32,"h":22,"weight":11.364336818339147},{"id":70,"l":25,"b":25,"h":32,"weight":14.57784845840147},{"id":97,"l":23,"b":22,"h":40,"weight":3.2404087035059748},{"id":0,"l":22,"b":26,"h":36,"weight":16.093665484613155},{"id":20,"l":32,"b":28,"h":23,"weight":6.105939599542991},{"id":94,"l":27,"b":35,"h":22,"weight":4.415246868746678},{"id":9,"l":27,"b":23,"h":34,"weight":1.946753195940969},{"id":93,"l":31,"b":22,"h":32,"weight":21.50995442856736},{"id":2,"l":27,"b":27,"h":30,"weight":17.667366202642995},{"id":71,"l":27,"b":33,"h":25,"weight":15.75517438921587},{"id":76,"l":21,"b":28,"h":38,"weight":7.429303206362379},{"id":49,"l":24,"b":24,"h":39,"weight":11.478326197037989},{"id":78,"l":22,"b":38,"h":27,"weight":18.455676524076893},{"id":88,"l":26,"b":35,"h":25,"weight":0.9699530053335081},{"id":33,"l":34,"b":21,"h":32,"weight":24.239957400704938},{"id":86,"l":25,"b":23,"h":40,"weight":18.09549907898296},{"id":4,"l":37,"b":24,"h":26,"weight":9.487921863035343},{"id":81,"l":25,"b":30,"h":31,"weight":9.139865840818096},{"id":43,"l":30,"b":26,"h":30,"weight":24.26232930816665},{"id":68,"l":28,"b":35,"h":24,"weight":9.005780799160242},{"id":84,"l":37,"b":22,"h":29,"weight":0.6178611192579386},{"id":77,"l":32,"b":34,"h":22,"weight":18.64229377819448},{"id":53,"l":35,"b":30,"h":23,"weight":26.496847353834493},{"id":56,"l":33,"b":31,"h":24,"weight":29.59836014297159,"heavy":true},{"id":74,"l":30,"b":35,"h":24,"weight":8.960694713923294},{"id":28,"l":34,"b":34,"h":22,"weight":15.369934327427465},{"id":3,"l":34,"b":27,"h":28,"weight":18.701171432157967},{"id":30,"l":37,"b":28,"h":25,"weight":15.077440069070096},{"id":46,"l":40,"b":24,"h":27,"weight":3.6163665769692144},{"id":67,"l":35,"b":24,"h":31,"weight":7.771779026714247},{"id":24,"l":35,"b":24,"h":31,"weight":25.270931113697404},{"id":23,"l":31,"b":30,"h":29,"weight":26.11981924304361},{"id":40,"l":39,"b":24,"h":29,"weight":0.16539321499317472},{"id":95,"l":35,"b":29,"h":27,"weight":17.64554744051333},{"id":42,"l":25,"b":38,"h":29,"weight":12.175004168843515},{"id":14,"l":28,"b":38,"h":26,"weight":11.61484399237407},{"id":65,"l":36,"b":37,"h":21,"weight":19.21840474585028},{"id":57,"l":27,"b":37,"h":28,"weight":26.63980839091846},{"id":16,"l":28,"b":35,"h":29,"weight":9.483466791065275},{"id":1,"l":33,"b":32,"h":27,"weight":10.8357904803525},{"id":37,"l":25,"b":36,"h":32,"weight":28.51016057956189,"heavy":true},{"id":79,"l":33,"b":34,"h":26,"weight":0.5838271763078984},{"id":83,"l":36,"b":22,"h":37,"weight":3.056265603933983},{"id":51,"l":33,"b":34,"h":28,"weight":26.309137613438892},{"id":85,"l":31,"b":32,"h":32,"weight":14.350839133465891},{"id":98,"l":30,"b":37,"h":29,"weight":11.61732623812642},{"id":82,"l":35,"b":40,"h":23,"weight":23.706833725894324},{"id":72,"l":29,"b":29,"h":39,"weight":29.30913974926043,"heavy":true},{"id":91,"l":29,"b":30,"h":38,"weight":3.5865122975081265},{"id":52,"l":35,"b":26,"h":37,"weight":4.839286663491098},{"id":13,"l":37,"b":24,"h":38,"weight":17.657981490529153},{"id":75,"l":32,"b":36,"h":30,"weight":8.687703545766501},{"id":55,"l":36,"b":37,"h":26,"weight":22.48762302159906},{"id":99,"l":38,"b":38,"h":24,"weight":19.741663999555584},{"id":31,"l":32,"b":35,"h":31,"weight":13.00040714591772},{"id":36,"l":28,"b":40,"h":31,"weight":25.949981233693073},{"id":87,"l":32,"b":34,"h":32,"weight":15.374188710865752},{"id":32,"l":25,"b":38,"h":37,"weight":20.074620049181867},{"id":54,"l":34,"b":26,"h":40,"weight":19.532050152956128},{"id":48,"l":40,"b":36,"h":25,"weight":13.67986502429352},{"id":22,"l":40,"b":36,"h":25,"weight":27.222715994183154,"heavy":true},{"id":25,"l":37,"b":39,"h":26,"weight":9.020129036788646},{"id":59,"l":37,"b":40,"h":26,"weight":26.608004530686173},{"id":34,"l":37,"b":29,"h":36,"weight":9.62276092234049},{"id":15,"l":25,"b":40,"h":39,"weight":13.605066733913336},{"id":62,"l":33,"b":37,"h":32,"weight":6.350320915044552},{"id":44,"l":38,"b":39,"h":27,"weight":10.825609761402571},{"id":29,"l":38,"b":32,"h":33,"weight":27.38340114782676,"heavy":true},{"id":17,"l":30,"b":34,"h":40,"weight":11.063160950866195},{"id":10,"l":38,"b":32,"h":34,"weight":28.055240502714952,"heavy":true},{"id":80,"l":34,"b":40,"h":32,"weight":8.298644465320608},{"id":26,"l":31,"b":36,"h":39,"weight":27.157963021699658,"heavy":true}];

newItems.forEach(_ => _.spinnable = true);*/


//let newItems = require('./input1.json');

// Thin
let newItems = [{"id":0,"l":27,"b":30,"h":37,"weight":23.8243824415764,"spinnable":true,"unstackable":false},{"id":1,"l":24,"b":25,"h":40,"weight":24.19723690787775,"spinnable":true,"unstackable":false},{"id":2,"l":22,"b":24,"h":35,"weight":29.171157759232564,"spinnable":true,"unstackable":false},{"id":3,"l":23,"b":27,"h":21,"weight":22.785189966281052,"spinnable":true,"unstackable":false},{"id":4,"l":21,"b":34,"h":22,"weight":9.95839134825328,"spinnable":true,"unstackable":false},{"id":5,"l":26,"b":29,"h":21,"weight":19.47137816799697,"spinnable":true,"unstackable":false},{"id":6,"l":40,"b":33,"h":40,"weight":13.956884628026174,"spinnable":true,"unstackable":true},{"id":7,"l":35,"b":37,"h":35,"weight":23.192830844833562,"spinnable":true,"unstackable":true},{"id":8,"l":40,"b":33,"h":35,"weight":4.459304635675467,"spinnable":true,"unstackable":false},{"id":9,"l":25,"b":31,"h":26,"weight":0.8697855663563958,"spinnable":true,"unstackable":false},{"id":10,"l":29,"b":28,"h":35,"weight":23.69631724494008,"spinnable":true,"unstackable":false},{"id":11,"l":25,"b":26,"h":24,"weight":11.552444275721857,"spinnable":true,"unstackable":false},{"id":12,"l":28,"b":36,"h":27,"weight":3.3680129558021132,"spinnable":true,"unstackable":false},{"id":13,"l":40,"b":32,"h":35,"weight":2.33135335134127,"spinnable":true,"unstackable":false},{"id":14,"l":29,"b":26,"h":25,"weight":17.7970786560673,"spinnable":true,"unstackable":false},{"id":15,"l":24,"b":33,"h":38,"weight":11.240342862932806,"spinnable":true,"unstackable":false},{"id":16,"l":35,"b":24,"h":22,"weight":12.138284983033907,"spinnable":true,"unstackable":false},{"id":17,"l":32,"b":30,"h":38,"weight":4.6695800163602,"spinnable":true,"unstackable":false},{"id":18,"l":26,"b":25,"h":29,"weight":29.722640918637627,"spinnable":true,"unstackable":false},{"id":19,"l":40,"b":39,"h":31,"weight":24.86821805050382,"spinnable":true,"unstackable":false},{"id":20,"l":23,"b":38,"h":21,"weight":14.619968912310085,"spinnable":true,"unstackable":true},{"id":21,"l":30,"b":34,"h":22,"weight":27.850761836439805,"spinnable":true,"unstackable":false},{"id":22,"l":35,"b":33,"h":22,"weight":13.890810204513254,"spinnable":true,"unstackable":false},{"id":23,"l":28,"b":30,"h":31,"weight":10.311343132069041,"spinnable":true,"unstackable":false},{"id":24,"l":21,"b":39,"h":26,"weight":28.12506938444379,"spinnable":true,"unstackable":false},{"id":25,"l":24,"b":32,"h":29,"weight":19.565167282107396,"spinnable":true,"unstackable":false},{"id":26,"l":23,"b":31,"h":30,"weight":28.988549408655516,"spinnable":true,"unstackable":false},{"id":27,"l":27,"b":31,"h":30,"weight":9.104639088133004,"spinnable":true,"unstackable":false},{"id":28,"l":23,"b":30,"h":33,"weight":23.854778877556203,"spinnable":true,"unstackable":false},{"id":29,"l":21,"b":28,"h":30,"weight":0.5309597179832526,"spinnable":true,"unstackable":false},{"id":30,"l":21,"b":40,"h":29,"weight":15.147503842887083,"spinnable":true,"unstackable":true},{"id":31,"l":29,"b":29,"h":27,"weight":4.0661973065357015,"spinnable":true,"unstackable":false},{"id":32,"l":24,"b":31,"h":29,"weight":20.43277483772848,"spinnable":true,"unstackable":false},{"id":33,"l":37,"b":22,"h":36,"weight":6.777035598472283,"spinnable":true,"unstackable":false},{"id":34,"l":30,"b":39,"h":36,"weight":12.037948757711188,"spinnable":true,"unstackable":true},{"id":35,"l":39,"b":24,"h":33,"weight":9.204916326738319,"spinnable":true,"unstackable":false},{"id":36,"l":21,"b":28,"h":40,"weight":9.693379398331976,"spinnable":true,"unstackable":false},{"id":37,"l":33,"b":38,"h":22,"weight":15.86285487431782,"spinnable":true,"unstackable":false},{"id":38,"l":31,"b":40,"h":22,"weight":10.241082483988983,"spinnable":true,"unstackable":false},{"id":39,"l":21,"b":21,"h":34,"weight":15.67076627173477,"spinnable":true,"unstackable":false},{"id":40,"l":24,"b":25,"h":22,"weight":27.895331136912855,"spinnable":true,"unstackable":false},{"id":41,"l":21,"b":28,"h":28,"weight":25.757697189071756,"spinnable":true,"unstackable":false},{"id":42,"l":26,"b":30,"h":26,"weight":5.552416233944513,"spinnable":true,"unstackable":false},{"id":43,"l":37,"b":28,"h":38,"weight":2.7302499043669792,"spinnable":true,"unstackable":false},{"id":44,"l":36,"b":40,"h":40,"weight":23.66883275584508,"spinnable":true,"unstackable":false},{"id":45,"l":25,"b":39,"h":36,"weight":13.705050572168776,"spinnable":true,"unstackable":false},{"id":46,"l":25,"b":21,"h":40,"weight":9.570352841485994,"spinnable":true,"unstackable":false},{"id":47,"l":40,"b":37,"h":21,"weight":23.694206704883857,"spinnable":true,"unstackable":false},{"id":48,"l":25,"b":40,"h":37,"weight":23.607284294845595,"spinnable":true,"unstackable":false},{"id":49,"l":23,"b":31,"h":28,"weight":16.91424458327872,"spinnable":true,"unstackable":false},{"id":50,"l":27,"b":25,"h":32,"weight":24.184479677788705,"spinnable":true,"unstackable":false},{"id":51,"l":26,"b":32,"h":40,"weight":18.980955101831565,"spinnable":true,"unstackable":false},{"id":52,"l":35,"b":37,"h":32,"weight":25.040706108000876,"spinnable":true,"unstackable":false},{"id":53,"l":40,"b":28,"h":25,"weight":12.795393584908954,"spinnable":true,"unstackable":false},{"id":54,"l":37,"b":39,"h":21,"weight":9.677237734468864,"spinnable":true,"unstackable":false},{"id":55,"l":40,"b":25,"h":26,"weight":15.288498245087968,"spinnable":true,"unstackable":false},{"id":56,"l":29,"b":21,"h":26,"weight":11.612053031746834,"spinnable":true,"unstackable":false},{"id":57,"l":24,"b":38,"h":30,"weight":1.0558516088625391,"spinnable":true,"unstackable":false},{"id":58,"l":34,"b":40,"h":22,"weight":23.331385361416388,"spinnable":true,"unstackable":true},{"id":59,"l":34,"b":27,"h":22,"weight":25.74511254248882,"spinnable":true,"unstackable":false},{"id":60,"l":24,"b":28,"h":37,"weight":1.2778237657838787,"spinnable":true,"unstackable":false},{"id":61,"l":29,"b":33,"h":36,"weight":3.4189831500297574,"spinnable":true,"unstackable":false},{"id":62,"l":33,"b":31,"h":26,"weight":6.59874363845558,"spinnable":true,"unstackable":true},{"id":63,"l":27,"b":23,"h":30,"weight":7.660088863188044,"spinnable":true,"unstackable":false},{"id":64,"l":24,"b":25,"h":30,"weight":20.936317023318882,"spinnable":true,"unstackable":true},{"id":65,"l":39,"b":36,"h":23,"weight":25.68739595498892,"spinnable":true,"unstackable":false},{"id":66,"l":26,"b":24,"h":36,"weight":8.785644354594693,"spinnable":true,"unstackable":false},{"id":67,"l":24,"b":26,"h":33,"weight":11.094059931953304,"spinnable":true,"unstackable":false},{"id":68,"l":37,"b":31,"h":38,"weight":9.321486670842718,"spinnable":true,"unstackable":false},{"id":69,"l":25,"b":32,"h":21,"weight":25.69819577001019,"spinnable":true,"unstackable":false},{"id":70,"l":38,"b":28,"h":26,"weight":1.7986507266475482,"spinnable":true,"unstackable":false},{"id":71,"l":24,"b":36,"h":40,"weight":3.080008941299668,"spinnable":true,"unstackable":false},{"id":72,"l":37,"b":23,"h":23,"weight":19.50192913546031,"spinnable":true,"unstackable":false},{"id":73,"l":40,"b":22,"h":21,"weight":23.388158737319632,"spinnable":true,"unstackable":false},{"id":74,"l":39,"b":34,"h":40,"weight":19.847365397111453,"spinnable":true,"unstackable":false},{"id":75,"l":40,"b":29,"h":34,"weight":18.979412438525202,"spinnable":true,"unstackable":false},{"id":76,"l":39,"b":24,"h":32,"weight":24.894770334246147,"spinnable":true,"unstackable":false},{"id":77,"l":27,"b":40,"h":34,"weight":15.478405452858441,"spinnable":true,"unstackable":false},{"id":78,"l":31,"b":31,"h":28,"weight":29.37979494172893,"spinnable":true,"unstackable":false},{"id":79,"l":24,"b":35,"h":32,"weight":10.740385595370704,"spinnable":true,"unstackable":true},{"id":80,"l":30,"b":40,"h":36,"weight":8.059603701569573,"spinnable":true,"unstackable":false},{"id":81,"l":23,"b":39,"h":40,"weight":13.06278833760581,"spinnable":true,"unstackable":false},{"id":82,"l":33,"b":31,"h":33,"weight":25.35928755678367,"spinnable":true,"unstackable":false},{"id":83,"l":30,"b":22,"h":21,"weight":24.881923649531863,"spinnable":true,"unstackable":false},{"id":84,"l":37,"b":36,"h":27,"weight":27.39252999571513,"spinnable":true,"unstackable":false},{"id":85,"l":36,"b":28,"h":38,"weight":10.79231821355978,"spinnable":true,"unstackable":true},{"id":86,"l":27,"b":29,"h":25,"weight":8.420832772919521,"spinnable":true,"unstackable":false},{"id":87,"l":28,"b":30,"h":38,"weight":0.35878876682817307,"spinnable":true,"unstackable":false},{"id":88,"l":34,"b":36,"h":35,"weight":27.89527064295339,"spinnable":true,"unstackable":false},{"id":89,"l":36,"b":39,"h":23,"weight":14.839306011646634,"spinnable":true,"unstackable":true},{"id":90,"l":35,"b":33,"h":27,"weight":2.958635262597933,"spinnable":true,"unstackable":false},{"id":91,"l":25,"b":36,"h":28,"weight":8.59854917139691,"spinnable":true,"unstackable":false},{"id":92,"l":39,"b":32,"h":22,"weight":4.5821202673375705,"spinnable":true,"unstackable":false},{"id":93,"l":29,"b":38,"h":40,"weight":5.291723054736055,"spinnable":true,"unstackable":false},{"id":94,"l":21,"b":33,"h":28,"weight":28.849311082360167,"spinnable":true,"unstackable":true},{"id":95,"l":38,"b":23,"h":22,"weight":4.570698515374505,"spinnable":true,"unstackable":false},{"id":96,"l":29,"b":40,"h":26,"weight":16.825154762749893,"spinnable":true,"unstackable":false},{"id":97,"l":29,"b":39,"h":31,"weight":7.5276352138148255,"spinnable":true,"unstackable":false},{"id":98,"l":26,"b":32,"h":31,"weight":14.934745545818021,"spinnable":true,"unstackable":false},{"id":99,"l":40,"b":38,"h":37,"weight":3.1596082057840147,"spinnable":true,"unstackable":false}];

// Thicc
//et newItems = [{"id":0,"l":37,"b":36,"h":33,"weight":10.988112023001298,"spinnable":true,"unstackable":false},{"id":1,"l":40,"b":31,"h":31,"weight":13.703375340109243,"spinnable":true,"unstackable":false},{"id":2,"l":34,"b":32,"h":32,"weight":29.042713097124608,"spinnable":true,"unstackable":false},{"id":3,"l":37,"b":40,"h":32,"weight":8.839781028166428,"spinnable":true,"unstackable":false},{"id":4,"l":34,"b":32,"h":34,"weight":3.251097161905596,"spinnable":true,"unstackable":false},{"id":5,"l":37,"b":31,"h":31,"weight":7.174243652141659,"spinnable":true,"unstackable":false},{"id":6,"l":36,"b":34,"h":39,"weight":12.433084036649582,"spinnable":true,"unstackable":false},{"id":7,"l":40,"b":32,"h":32,"weight":6.2653089060356475,"spinnable":true,"unstackable":false},{"id":8,"l":32,"b":39,"h":34,"weight":10.951534008334512,"spinnable":true,"unstackable":false},{"id":9,"l":39,"b":31,"h":35,"weight":19.44885386094845,"spinnable":true,"unstackable":false},{"id":10,"l":36,"b":33,"h":33,"weight":15.177224210335345,"spinnable":true,"unstackable":false},{"id":11,"l":32,"b":32,"h":34,"weight":9.776399094159443,"spinnable":true,"unstackable":false},{"id":12,"l":33,"b":32,"h":39,"weight":11.755233994245117,"spinnable":true,"unstackable":false},{"id":13,"l":35,"b":39,"h":33,"weight":21.385401361090512,"spinnable":true,"unstackable":false},{"id":14,"l":31,"b":39,"h":33,"weight":16.22998205370053,"spinnable":true,"unstackable":false},{"id":15,"l":40,"b":39,"h":36,"weight":4.858776860869478,"spinnable":true,"unstackable":false},{"id":16,"l":37,"b":34,"h":38,"weight":29.985479970523528,"spinnable":true,"unstackable":false},{"id":17,"l":33,"b":38,"h":40,"weight":14.479773938916072,"spinnable":true,"unstackable":false},{"id":18,"l":38,"b":34,"h":37,"weight":21.656654212532228,"spinnable":true,"unstackable":false},{"id":19,"l":38,"b":35,"h":37,"weight":25.31466945946865,"spinnable":true,"unstackable":false},{"id":20,"l":36,"b":33,"h":36,"weight":29.127235671701335,"spinnable":true,"unstackable":false},{"id":21,"l":35,"b":32,"h":31,"weight":24.030347276990124,"spinnable":true,"unstackable":false},{"id":22,"l":32,"b":33,"h":35,"weight":28.13220633803215,"spinnable":true,"unstackable":false},{"id":23,"l":36,"b":40,"h":33,"weight":20.24742214787223,"spinnable":true,"unstackable":false},{"id":24,"l":33,"b":35,"h":36,"weight":14.84357214997004,"spinnable":true,"unstackable":false},{"id":25,"l":38,"b":34,"h":32,"weight":13.685213219639103,"spinnable":true,"unstackable":false},{"id":26,"l":40,"b":34,"h":33,"weight":0.8723397310193204,"spinnable":true,"unstackable":false},{"id":27,"l":32,"b":36,"h":38,"weight":18.915321091619333,"spinnable":true,"unstackable":false},{"id":28,"l":36,"b":39,"h":38,"weight":10.851744026230563,"spinnable":true,"unstackable":false},{"id":29,"l":35,"b":34,"h":36,"weight":11.865213404891264,"spinnable":true,"unstackable":true},{"id":30,"l":33,"b":37,"h":33,"weight":6.248044582375549,"spinnable":true,"unstackable":false},{"id":31,"l":35,"b":38,"h":38,"weight":9.17050964955704,"spinnable":true,"unstackable":false},{"id":32,"l":37,"b":34,"h":36,"weight":18.150721433002563,"spinnable":true,"unstackable":false},{"id":33,"l":33,"b":35,"h":37,"weight":8.309666928823559,"spinnable":true,"unstackable":false},{"id":34,"l":34,"b":35,"h":39,"weight":27.691152696766814,"spinnable":true,"unstackable":true},{"id":35,"l":32,"b":39,"h":34,"weight":0.7932463781880439,"spinnable":true,"unstackable":false},{"id":36,"l":39,"b":36,"h":39,"weight":26.093478073363407,"spinnable":true,"unstackable":true},{"id":37,"l":39,"b":32,"h":33,"weight":1.2735233894945441,"spinnable":true,"unstackable":false},{"id":38,"l":32,"b":31,"h":37,"weight":26.633528821533435,"spinnable":true,"unstackable":false},{"id":39,"l":37,"b":33,"h":37,"weight":21.867765249616816,"spinnable":true,"unstackable":false},{"id":40,"l":38,"b":35,"h":38,"weight":21.46948354422409,"spinnable":true,"unstackable":false},{"id":41,"l":37,"b":31,"h":32,"weight":6.017640257845411,"spinnable":true,"unstackable":true},{"id":42,"l":39,"b":34,"h":32,"weight":10.72196824276742,"spinnable":true,"unstackable":false},{"id":43,"l":38,"b":40,"h":33,"weight":14.031503840209826,"spinnable":true,"unstackable":false},{"id":44,"l":34,"b":32,"h":40,"weight":25.059623923371145,"spinnable":true,"unstackable":false},{"id":45,"l":39,"b":39,"h":37,"weight":3.4314437234692763,"spinnable":true,"unstackable":false},{"id":46,"l":39,"b":38,"h":39,"weight":1.3516047614056248,"spinnable":true,"unstackable":false},{"id":47,"l":36,"b":40,"h":36,"weight":13.614577990421697,"spinnable":true,"unstackable":false},{"id":48,"l":32,"b":36,"h":32,"weight":5.25384893947356,"spinnable":true,"unstackable":false},{"id":49,"l":33,"b":31,"h":39,"weight":18.346098229988975,"spinnable":true,"unstackable":false},{"id":50,"l":40,"b":38,"h":38,"weight":16.97974738966603,"spinnable":true,"unstackable":false},{"id":51,"l":31,"b":34,"h":37,"weight":12.515503102341533,"spinnable":true,"unstackable":false},{"id":52,"l":35,"b":37,"h":35,"weight":29.673056310617806,"spinnable":true,"unstackable":false},{"id":53,"l":39,"b":34,"h":34,"weight":10.204513769034351,"spinnable":true,"unstackable":false},{"id":54,"l":35,"b":32,"h":40,"weight":27.514475994795927,"spinnable":true,"unstackable":false},{"id":55,"l":31,"b":37,"h":40,"weight":4.244292875514999,"spinnable":true,"unstackable":true},{"id":56,"l":39,"b":34,"h":37,"weight":18.127025040903874,"spinnable":true,"unstackable":false},{"id":57,"l":37,"b":33,"h":33,"weight":24.83927533545364,"spinnable":true,"unstackable":false},{"id":58,"l":38,"b":32,"h":33,"weight":18.46349861299258,"spinnable":true,"unstackable":true},{"id":59,"l":32,"b":31,"h":40,"weight":25.98771589288722,"spinnable":true,"unstackable":false},{"id":60,"l":37,"b":34,"h":37,"weight":2.723034742005006,"spinnable":true,"unstackable":false},{"id":61,"l":38,"b":39,"h":32,"weight":13.085985957825216,"spinnable":true,"unstackable":false},{"id":62,"l":32,"b":37,"h":31,"weight":27.41883698646971,"spinnable":true,"unstackable":false},{"id":63,"l":31,"b":40,"h":32,"weight":28.353349821679707,"spinnable":true,"unstackable":false},{"id":64,"l":40,"b":31,"h":34,"weight":21.554916554061226,"spinnable":true,"unstackable":false},{"id":65,"l":31,"b":33,"h":34,"weight":22.899916191234094,"spinnable":true,"unstackable":false},{"id":66,"l":40,"b":33,"h":37,"weight":0.9658442078983343,"spinnable":true,"unstackable":false},{"id":67,"l":36,"b":33,"h":40,"weight":26.431299122806486,"spinnable":true,"unstackable":false},{"id":68,"l":40,"b":35,"h":36,"weight":14.086151933933408,"spinnable":true,"unstackable":false},{"id":69,"l":40,"b":33,"h":36,"weight":28.786451181068646,"spinnable":true,"unstackable":false},{"id":70,"l":38,"b":36,"h":34,"weight":14.401168016889347,"spinnable":true,"unstackable":false},{"id":71,"l":34,"b":34,"h":31,"weight":20.624617102701272,"spinnable":true,"unstackable":false},{"id":72,"l":39,"b":33,"h":31,"weight":12.348702110189674,"spinnable":true,"unstackable":false},{"id":73,"l":36,"b":31,"h":33,"weight":22.519806610000064,"spinnable":true,"unstackable":false},{"id":74,"l":35,"b":35,"h":35,"weight":2.0856462822525845,"spinnable":true,"unstackable":false},{"id":75,"l":33,"b":40,"h":36,"weight":27.990722754394454,"spinnable":true,"unstackable":false},{"id":76,"l":32,"b":36,"h":36,"weight":18.817268558191532,"spinnable":true,"unstackable":false},{"id":77,"l":39,"b":35,"h":34,"weight":3.6286696613380154,"spinnable":true,"unstackable":false},{"id":78,"l":37,"b":31,"h":32,"weight":28.976485958073003,"spinnable":true,"unstackable":false},{"id":79,"l":31,"b":39,"h":38,"weight":28.798699436241478,"spinnable":true,"unstackable":false},{"id":80,"l":40,"b":34,"h":31,"weight":17.29985869106794,"spinnable":true,"unstackable":false},{"id":81,"l":33,"b":38,"h":36,"weight":7.18810015995988,"spinnable":true,"unstackable":false},{"id":82,"l":40,"b":40,"h":34,"weight":23.233776932016635,"spinnable":true,"unstackable":false},{"id":83,"l":37,"b":33,"h":38,"weight":25.028919631776798,"spinnable":true,"unstackable":false},{"id":84,"l":34,"b":35,"h":35,"weight":0.6175231189715991,"spinnable":true,"unstackable":false},{"id":85,"l":33,"b":34,"h":33,"weight":29.081898069395486,"spinnable":true,"unstackable":false},{"id":86,"l":35,"b":35,"h":33,"weight":1.890561163184299,"spinnable":true,"unstackable":false},{"id":87,"l":39,"b":40,"h":34,"weight":26.244579989863276,"spinnable":true,"unstackable":true},{"id":88,"l":32,"b":37,"h":33,"weight":14.907347945892882,"spinnable":true,"unstackable":true},{"id":89,"l":38,"b":37,"h":36,"weight":28.32519684267538,"spinnable":true,"unstackable":false},{"id":90,"l":38,"b":39,"h":37,"weight":13.634675781858096,"spinnable":true,"unstackable":true},{"id":91,"l":32,"b":33,"h":40,"weight":5.6985629198398735,"spinnable":true,"unstackable":false},{"id":92,"l":37,"b":38,"h":37,"weight":20.16822254546985,"spinnable":true,"unstackable":false},{"id":93,"l":36,"b":32,"h":33,"weight":11.47233772694033,"spinnable":true,"unstackable":false},{"id":94,"l":38,"b":37,"h":34,"weight":10.336963099422487,"spinnable":true,"unstackable":false},{"id":95,"l":37,"b":31,"h":31,"weight":24.02771542188681,"spinnable":true,"unstackable":false},{"id":96,"l":39,"b":35,"h":35,"weight":18.31038758619801,"spinnable":true,"unstackable":false},{"id":97,"l":32,"b":40,"h":31,"weight":23.009363573391436,"spinnable":true,"unstackable":false},{"id":98,"l":31,"b":31,"h":39,"weight":6.610278598775721,"spinnable":true,"unstackable":false},{"id":99,"l":34,"b":39,"h":38,"weight":1.5676067222083412,"spinnable":true,"unstackable":false}];

/*let newItems = Array(100).fill(true).map((_, id) => {
  const d = Math.ceil(Math.random() * 30)
  return {
    id,
    l: Math.ceil(Math.random() * 10) + 30,
    b: Math.ceil(Math.random() * 10) + 30,
    h: Math.ceil(Math.random() * 10) + 30,
    weight: Math.random() * 30,
    spinnable: true,
    unstackable: Math.floor(Math.random() * 6) === 0
  }
});

console.log('items');
console.log(JSON.stringify(newItems));*/

/*let newItems = Array(100).fill(true).map((_, id) => {
  const d = Math.ceil(Math.random() * 20) + 20
  return {
    id,
    l: d,
    b: d,
    h: d,
    weight: Math.random() * 30,
    spinnable: true
  }
});*/

window.newItems = newItems;

/*newItems.sort((a, b) => a.weight < b.weight ? 1 : -1)
  .forEach((item, i) => {
    if (i < 5) {
      item.heavy = true;
    }
  });*/

sortItemsByVolume(newItems);

debugger;

newItems = putNHeaviestItemsFirst(newItems);

newItems.reverse();

debugger;

//newItems[94] = {"id":66,"l":37,"b":10,"h":50,"weight":16.93326049314387};

/*const newItems = sortItemsByVolume(Array(200).fill(true).map(() => ({
  l: Math.random() * 50,
  b: Math.random() * 50,
  h: Math.random() * 50,
})));*/


export default () => {
  const [ulds, setUlds]  = useState([]);
  /*useEffect(() => {
	  debugger;
    fetch('http://localhost:8080/pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(d)
    }).then(data => {
      data.json().then(data => setUlds(data))
    });
  }, []);*/

  /*const subBins = [{
    x: -122 + 40 + (244 - 40) / 2,
    y: -81.5 + 45 / 2,
    z: -81.5 + 163 / 2,
    l: 244 - 40,
    b: 45,
    h: 163
  }];*/
  const [_items, setItems] = useState(items);

  const addItem = () => {
    //const nextItem = newItems.pop();

    if (true) {
    //if (nextItem) {
      items = items.concat(newItems.reverse());
      //items = items.concat(nextItem);
      //items.forEach(_ => _.packed = false);
      let result = pack(items);

      console.dir(result.items);

      items = result.items;

      setItems(result.items);

      if (newItems.length > 0) {
        //setTimeout(addItem, 100);
      }
      /*else while (items.filter(_ => !_.packed).length !== 0) {debugger;
        result = pack(items);
        items = result.items;
      }*/
    }
  }

  const packedItems = _items.filter(_ => _.packed);

  return (
    <>
      {/*<div>
        {(ulds || []).reduce((acc, uld) => acc + uld.items.length, 0)}
      </div>*/}
      <div>
        Bins: {bins.length}
        Pack status: {packedItems.length} / {_items.length}
        {' '}Occupancy: {packedItems.reduce((acc, i ) => acc + (i.l * i.b * i.h), 0) / (244 * 163 * 163) * 100}
      </div>
      {shape.map(uld =>
        <Canvas style={style} camera={camera}>
          <ULDScene uld={uld} items={_items} subBins={[]/*binsForHeaviestFromMiddle *//*[
      splitBinByLength(theBin, items[0]),
      splitBinByBreadth(theBin, items[0]),
      splitBinByHeight(theBin, items[0])
  ]*/} />
        </Canvas>)}
      <button onClick={addItem}>Pack</button>
    </>
  );
};

/*const splitBinByLength = (bin, item) => {
  return {
    x: -bin.l / 2 + item.l + (bin.l - item.l) / 2,
    y: -bin.b / 2 + item.b / 2,
    z: -bin.h / 2 + bin.h / 2,
    l: bin.l - item.l,
    b: item.b,
    h: bin.h,
    color: '#CECECE'
  };
};*/
