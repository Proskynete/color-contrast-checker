import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as FullStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as EmptyStar } from "@fortawesome/free-regular-svg-icons";
import { Contrast } from "../../helpers/texts";
import { useEffect, useState } from "react";

interface StarMakerSectionProps {
  assessment: Contrast;
}

const StarMakerSection = ({ assessment }: StarMakerSectionProps) => {
  const [stars, setStars] = useState(Array(3).fill(EmptyStar));

  useEffect(() => {
    if (assessment === "good") {
      setStars(Array(3).fill(FullStar));
    } else if (assessment === "warning") {
      setStars([FullStar, FullStar, EmptyStar]);
    } else {
      setStars([FullStar, EmptyStar, EmptyStar]);
    }
  }, [assessment]);

  return (
    <div>
      {stars.map((star, index) => (
        <FontAwesomeIcon key={index} icon={star} />
      ))}
    </div>
  );
};

export { StarMakerSection };
