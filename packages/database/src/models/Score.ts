import {
    ModelOptions,
    Plugins,
    Pre,
    Prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import type { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import type { Game } from './Game';
import type { User } from './User';

@ModelOptions({
    options: { customName: 'Score' },
    schemaOptions: {
        toJSON: {
            transform(_, record: Partial<Score.Document>) {
                record.id ??= record._id?.toString();
                delete record._id;
                delete record.__v;
                return record;
            },
        },
    },
})
@Pre('save', async function save(this: Score.Document) {
    this.lastPlayedAt = new Date();
})
@Plugins(require('mongoose-autopopulate'))
export class Score {
    public id!: string;

    /** The user this score object belongs to. */
    @Prop({ ref: 'User', required: true, autopopulate: true })
    public user!: Ref<User>;

    /** The game this score object is for. */
    @Prop({ ref: 'Game', required: true, autopopulate: true })
    public game!: Ref<Game>;

    /** The total score earned for this game. */
    @Prop({ default: 0 })
    public totalScore: number = 0;

    /** The total time spent playing this game. */
    @Prop({ default: 0 })
    public totalTime: number = 0;

    /** The total number of times this game has been played. */
    @Prop({ default: 0 })
    public totalPlays: number = 0;

    /** The highest score earned for this game by this user. */
    @Prop()
    public highScore?: number;

    /** The game time for the highest score. */
    @Prop()
    public highScoreTime?: number;

    /** Date of when the high score was achieved. */
    @Prop()
    public highScoreAt?: Date;

    /** The last score earned for this game. */
    @Prop()
    public lastScore?: number;

    /** The game time for the last score. */
    @Prop()
    public lastTime?: number;

    /** Date of when the last score was achieved. */
    @Prop()
    public lastPlayedAt?: Date;
}

export namespace Score {
    export const Model =
        (mongoose.models['Score'] as ReturnModelType<typeof Score>) ??
        getModelForClass(Score);

    export type Entity = {
        [K in keyof Score]: Score[K] extends Function ? never : Score[K];
    } & { user: User.Entity; game: Game.Entity };

    export type Document = DocumentType<Score>;
}
