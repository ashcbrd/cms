/* eslint-disable @next/next/no-img-element */
const Logo = ({ size }: { size?: string }) => {
  return (
    <img
      style={{
        width: size ? size : "80px",
        height: "auto",
      }}
      className="object-contain"
      src="/images/logo.png"
      alt=""
    />
  );
};

export default Logo;
