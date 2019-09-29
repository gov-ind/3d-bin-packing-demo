import React, { Fragment } from 'react';
import * as THREE from 'three/src/Three';
import { Canvas, extend, useThree } from 'react-three-fiber';
import OrbitControls from 'three-orbitcontrols';

extend({ OrbitControls });

const camera = {
  position: new THREE.Vector3(0, 0, 300)
};
const style = {
  width: 400,
  height: 400
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

const ULDScene = ({ uld, dimensions }) => {
  const { camera, gl } = useThree();

  return (
    <Fragment>
      <orbitControls args={[camera, gl.domElement]} enableDamping />
      <group>
        {uld.contour.map(face =>
          <line>
            <geometry
              attach='geometry'
              vertices={face.map(point => new THREE.Vector3(...point))}
            />
            <lineBasicMaterial attach='material' color='#8A8A8A' />
          </line>)}
      </group>
      {uld.items.map(item => {
        const dimension = dimensions[item];
        const material = dimension.isStackable && dimension.isTiltable
          ? plain
          : !dimension.isTiltable
            ? untiltable
            : unstackable;

        return (
          <mesh position={[dimension.x, dimension.y, dimension.z]} material={material}>         
            <boxBufferGeometry
              attach='geometry'
              args={[dimension.length, dimension.breadth, dimension.height]}
            />
          </mesh>
        );
      })}
    </Fragment>
  );
};

export default ({ uld, dimensions }) =>
  <Canvas style={style} camera={camera}>
    <ULDScene uld={uld} dimensions={dimensions} />
  </Canvas>