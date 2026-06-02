export type AtlasBlock = {
    type: string;
    data: Record<string, unknown>;
};

export type AtlasMediaDirectory = {
    id: number;
    name: string;
    slug: string;
};

export type AtlasMediaAsset = {
    id: number;
    title: string;
    alt?: string | null;
    url: string;
    directory_id?: number | null;
    directory_name?: string | null;
};

export type AtlasLatestPostPreview = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    url?: string;
};
