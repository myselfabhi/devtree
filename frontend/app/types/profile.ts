// app/types.ts

export type Link = {
    title: string;
    url: string;
    icon?: string;
  };
  
  export type Profile = {
    name: string;
    bio?: string;
    avatar?: string;
    links: Link[];
  };