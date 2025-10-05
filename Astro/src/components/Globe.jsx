import React from "react";
import { Viewer, Entity } from "resium";
import { Cartesian3, Color } from "cesium";

function Globe() {
  return (
    <div className="h-[600px] w-full">
      <Viewer full>
        <Entity
          name="Asteroid Impact"
          position={Cartesian3.fromDegrees(-74.006, 40.7128, 500000)} // lon, lat, alt
          point={{ pixelSize: 10, color: Color.RED }} // ✅ Use imported Color
        />
      </Viewer>
    </div>
  );
}

export default Globe;
