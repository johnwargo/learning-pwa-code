// News type
export interface News {
    type: string;
    name: string;
    description: string,
    url: string,
    published: string,
    category: string,
    image: Image,
    provider: Provider
}

export interface Image {
    type: string,
    url: string,
    width: number,
    height: number
}

export interface Provider {
    type: string,
    name: string
}

export interface UserSentiment {
    amazing: number,
    awesome: number,
    fantastic: number,
    great: number,
    ok: number,
    perfect: number
}