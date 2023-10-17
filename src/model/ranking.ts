export interface Ranking {
    season: number,
    seasonType: string,
    week: number,
    polls: Poll[]
}

export interface Poll {
    poll: string,
    ranks: Rank[]
}

export interface Rank {
    rank: number,
    school: string,
    conference: string,
    firstPlaceVotes: number,
    points: number
}