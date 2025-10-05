import { Viewer, Entity } from "resium";
import { Cartesian3,Color } from "cesium";
// import Cesium from

function Globe() {
  return (
    <div className="h-full w-full relative ">
      <Viewer full>
        <Entity
          name="Asteroid Impact"
          position={Cartesian3.fromDegrees(-74.006, 40.7128, 500000)} // lon, lat, alt
          point={{ pixelSize: 10, color: Color.RED }}
        />
      </Viewer>
    </div>
  );
}

export default Globe