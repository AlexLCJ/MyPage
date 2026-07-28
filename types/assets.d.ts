declare module "*.glb" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const image:
    | string
    | {
        src: string;
        width: number;
        height: number;
      };
  export default image;
}
