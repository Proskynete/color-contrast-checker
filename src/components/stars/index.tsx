"use client";

import { FaStar, FaRegStar } from "react-icons/fa6";
import { Contrast } from "../../helpers/texts";
import { useEffect, useState } from "react";

interface StarMakerSectionProps {
  assessment: Contrast;
}

const StarMakerSection = ({ assessment }: StarMakerSectionProps) => {
  const [stars, setStars] = useState(Array(3).fill(FaStar));

  useEffect(() => {
    if (assessment === "good") {
      setStars(Array(3).fill(FaStar));
    } else if (assessment === "warning") {
      setStars([FaStar, FaStar, FaRegStar]);
    } else {
      setStars([FaStar, FaRegStar, FaRegStar]);
    }
  }, [assessment]);

  return (
    <div className="flex gap-1">
      {stars.map((star, i) => {
        const IconComponent = star;
        return <IconComponent key={i} />;
      })}
    </div>
  );
};

export { StarMakerSection };
