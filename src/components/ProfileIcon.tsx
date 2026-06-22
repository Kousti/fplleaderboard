"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_PROFILE_ICON_ID, profileIconUrl } from "@/lib/profile-icons";

interface ProfileIconProps {
  profileIconId: number | null | undefined;
  size?: number;
}

export function ProfileIcon({ profileIconId, size = 40 }: ProfileIconProps) {
  const fallbackSrc = profileIconUrl(DEFAULT_PROFILE_ICON_ID);
  const [src, setSrc] = useState(() => profileIconUrl(profileIconId));

  useEffect(() => {
    setSrc(profileIconUrl(profileIconId));
  }, [profileIconId]);

  return (
    <Image
      className="opgg-profile-icon"
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setSrc((current) => (current === fallbackSrc ? current : fallbackSrc))}
    />
  );
}
