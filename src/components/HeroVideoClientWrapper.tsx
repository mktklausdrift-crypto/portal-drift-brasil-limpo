"use client";
import HeroVideo from "./HeroVideo";

import type { HeroVideoProps } from "./HeroVideo";

export default function HeroVideoClientWrapper(props: HeroVideoProps) {
  return <HeroVideo {...props} />;
}
