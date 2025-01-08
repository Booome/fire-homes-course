import { getUrl } from "aws-amplify/storage";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

export function PropertyImage({ src, alt, ...props }: ImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (
        typeof src === "string" &&
        (src.startsWith("http") || src.startsWith("blob"))
      ) {
        setImageUrl(src);
      } else {
        const path = await getUrl({ path: src as string });
        setImageUrl(path.url.toString());
      }
    };
    fetchImageUrl();
  }, [src]);

  return imageUrl ? <Image src={imageUrl} alt={alt} {...props} /> : <></>;
}
