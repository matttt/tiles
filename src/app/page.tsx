"use client"

import Image from "next/image";
import { useMeasure } from "@uidotdev/usehooks";
import { Game } from './game';
import {isMobile} from 'react-device-detect'

export default function Home() {
  const [ref, { width, height }] = useMeasure();

  const sideLength = Math.min(width||0, height||0) * (isMobile ? .8 : .6);

  return (
    <main ref={ref} className="flex min-h-screen flex-col items-center justify-between p-3 md:p-5">
      <div className="grow"></div>
        <Game sideLength={sideLength}/>
      <div className="grow"></div>
    </main>
  );
}
