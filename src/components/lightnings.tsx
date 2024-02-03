import { Fragment, useEffect, useState } from "react";

type Point = [number, number];

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const getCurrentYCoordinate = (p1: Point, p2: Point, x: number) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return ((y2 - y1) / (x2 - x1)) * (x - x1) + y1;
};

interface Props {
  color: { primary: string; backglow: string };
  startPoint: Point;
  endPoints: Point[];
}

interface LineParams {
  xProjection: number;
  yProjection: number;
  length: number;
}

const LightningsLayer = ({ startPoint, endPoints, color }: Props) => {
  const [intermediatePoints, setIntermediatePoints] = useState<string[]>([]);

  useEffect(() => {
    setInterval(() => {
      setIntermediatePoints(getDistortedPoints());
    }, 50);
  }, []);

  const lineProjections: LineParams[] = endPoints.map((point, i) => {
    const [width, height] = [Math.abs(endPoints[i][0] - startPoint[0]), Math.abs(endPoints[i][1] - startPoint[1])];
    return {
      xProjection: width,
      yProjection: height,
      length: Math.sqrt(width ** 2 + height ** 2),
    };
  });

  const deviateFromStraightLine = (line: LineParams) => {
    const distortionValue = line.length * 0.05;
    return [randomIntFromInterval(-distortionValue, distortionValue), randomIntFromInterval(-distortionValue, distortionValue)];
  };

  const intermediatePointsNumber = 10;

  const getDistortedPoints = () => {
    const points: Point[][] = endPoints.map((endPoint, index) => {
      const [firstPoint, secondPoint] = startPoint[0] < endPoint[0] ? [startPoint, endPoint] : [endPoint, startPoint];
      const step = (endPoint[0] - startPoint[0]) / intermediatePointsNumber;

      const currentPoints = [];
      for (let i = 1; i < intermediatePointsNumber; i++) {
        const [dx, dy] = deviateFromStraightLine(lineProjections[index]);
        currentPoints.push([startPoint[0] + i * step + dx, getCurrentYCoordinate(firstPoint, secondPoint, startPoint[0] + i * step) + dy]);
      }
      return currentPoints;
    });

    return points.map((point) => point.join(" "));
  };

  return (
    <svg height='100vh' width='100vw' style={{ position: "absolute", zIndex: 100 }}>
      {endPoints.map((endPoint, index) => {
        return (
          <Fragment key={index}>
            <polyline
              points={`${startPoint} ${intermediatePoints[index]} ${endPoint}`}
              style={{ fill: "none", stroke: color.primary, strokeWidth: 3 }}
            />
            <polyline
              points={`${startPoint} ${intermediatePoints[index]} ${endPoint}`}
              style={{ fill: "none", stroke: color.backglow, strokeWidth: 10, filter: "blur(6px)" }}
            />
          </Fragment>
        );
      })}
    </svg>
  );
};

export default LightningsLayer;
