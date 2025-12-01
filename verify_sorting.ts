
import { getCafeData } from './src/lib/dataClient';

const verifySorting = async () => {
    try {
        const cafes = await getCafeData();
        console.log(`Loaded ${cafes.length} cafes.`);

        let isSorted = true;
        for (let i = 0; i < cafes.length - 1; i++) {
            const current = cafes[i];
            const next = cafes[i + 1];

            if (current.timestamp && next.timestamp) {
                const currentDate = new Date(current.timestamp).getTime();
                const nextDate = new Date(next.timestamp).getTime();

                if (currentDate < nextDate) {
                    console.error(`Sorting error at index ${i}:`);
                    console.error(`Current (${current.id}): ${current.timestamp}`);
                    console.error(`Next (${next.id}): ${next.timestamp}`);
                    isSorted = false;
                    break;
                }
            }
        }

        if (isSorted) {
            console.log('Verification PASSED: Cafes are sorted by date (newest first).');
            // Print first 5 dates to confirm
            console.log('Top 5 dates:');
            cafes.slice(0, 5).forEach(c => console.log(`${c.store_name}: ${c.timestamp}`));
        } else {
            console.error('Verification FAILED: Cafes are NOT sorted correctly.');
        }

    } catch (error) {
        console.error('Verification failed with error:', error);
    }
};

verifySorting();
