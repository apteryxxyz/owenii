'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Game } from '@qwaroo/database';
import { FileQuestionIcon } from 'lucide-react';
import { executeServerAction } from 'next-sa/client';
import type { ServerActionDataType } from 'next-sa/server';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getGames } from './actions';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Form } from '@/components/Form';
import { Input } from '@/components/Input';
import { GameCard } from '@/features/GameCard';

const searchSchema = z.object({
    query: z.string().optional(),
});

interface ContentProps {
    data: ServerActionDataType<typeof getGames>[0];
    games: ServerActionDataType<typeof getGames>[1];
}

export default function Content(props: ContentProps) {
    const searchForm = useForm<z.infer<typeof searchSchema>>({
        resolver: zodResolver(searchSchema),
        defaultValues: { query: '' },
    });

    const [isPending, startTransition] = useTransition();
    const [total, setTotal] = useState(props.data.total);
    const [loaded, setLoaded] = useState<Game.Entity[]>(props.games);

    async function fetchMore(isInitial = false) {
        // Reset loaded games if this is the initial load
        if (isInitial && loaded.length > 0) setLoaded([]);
        const loadedLength = isInitial ? 0 : loaded.length;

        // Only fetch more if we have less than the total amount of games
        if (!isInitial && total !== -1 && loadedLength >= total) return;

        const [data, games] = await executeServerAction(getGames, {
            ...searchForm.getValues(),
            limit: 12,
            skip: loadedLength,
        }).catch(() => [null, null]);
        if (!data || !games) return;

        setLoaded(prev => {
            if (isInitial) return games;
            else return [...prev, ...games];
        });
    }

    return <>
        <h1 className="text-2xl font-bold leading-none tracking-tight pb-6">Games</h1>

        {/* TODO: Filtering will come later, less important right now */}

        <Form {...searchForm}>
            <form
                onSubmit={searchForm.handleSubmit(() =>
                    startTransition(async () => fetchMore(true))
                )}
                className="flex pb-6 space-x-6"
            >
                <Form.Field
                    control={searchForm.control}
                    name="query"
                    render={({ field }) => <Form.Item>
                        <div className="inline-flex space-x-6">
                            <Form.Control>
                                <Input placeholder="Search games..." {...field} />
                            </Form.Control>
                            <Button type="submit">Search</Button>
                        </div>
                        <Form.Message />
                    </Form.Item>}
                />
            </form>
        </Form>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {loaded.map(game => <GameCard key={game.id} game={game} />)}

            {isPending && Array.from({ length: 6 }).map((_, i) => <GameCard key={i} isLoading />)}

            {!isPending && loaded.length === 0 && <Alert>
                <FileQuestionIcon className="w-5 h-5 mr-2" />

                <Alert.Title>Hmm, no games were found</Alert.Title>
                <Alert.Description>
                    Check back later, or try a different search query.
                </Alert.Description>
            </Alert>}
        </div>
    </>;
}
