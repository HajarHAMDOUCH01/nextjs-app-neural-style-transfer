import Image from "next/image";
import ImageCanvas from "./imageCanvas";

export default function Home() {
  return (
    <div>
      <ImageCanvas width={256} height={256} />
    </div>
  );
}
