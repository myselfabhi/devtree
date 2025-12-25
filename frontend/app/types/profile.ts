export type Link = {
    title: string;
    url?: string;
};
  
  export type Profile = {
    name: string;
    bio?: string;
    avatar?: string;
    links: Link[];
  };