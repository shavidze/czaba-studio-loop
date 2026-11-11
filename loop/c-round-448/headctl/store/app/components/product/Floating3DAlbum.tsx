interface Product3DBoxProps {
  /** 3D box image path */
  imageSrc: string;
  /** Product title for alt text */
  title: string;
}

/**
 * 3D Product Box - პრე-რენდერირებული 3D ყუთის სურათი
 * უბრალოდ აჩვენებს 3D რენდერს
 */
export function Product3DBox({ imageSrc, title }: Product3DBoxProps) {
  return (
    <div className="relative">
      <img src={imageSrc} alt={`${title} - 3D Product Box`} className="w-full h-auto" />
    </div>
  );
}

// Legacy export for backwards compatibility
export const Floating3DAlbum = Product3DBox;
