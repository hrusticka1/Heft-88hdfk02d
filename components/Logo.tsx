import HeftLogo from '../assets/HeftLogo.svg';

type LogoProps = {
  height?: number;
};

export function Logo({ height = 32 }: LogoProps) {
  // SVG aspect ratio is 96:36 (width:height)
  const aspectRatio = 96 / 36;
  const width = height * aspectRatio;

  return <HeftLogo width={width} height={height} />;
}
