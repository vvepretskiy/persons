import { Person } from "@persons/shared";

export const getAverageHeight = (data: Pick<Person, 'height'>[]): string => {
    const items = data.filter(({ height }) => !isNaN(Number(height)) && !isNaN(parseFloat(height)));
    if (items.length === 0) return '0';

    const sum = items.reduce((acc, { height }) => acc + (parseInt(height) || 0), 0);
    const average = sum / items.length;
    const roundedAverage = Math.round(average * 10) / 10;

    return roundedAverage % 1 === 0 ? roundedAverage.toFixed(0) : roundedAverage.toFixed(1);
}
