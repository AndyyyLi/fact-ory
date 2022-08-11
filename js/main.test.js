/**
 * @jest-environment jsdom
 */

const { search, factSpace } = require('./main');

describe('search', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
    })

    test('for existing fact', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 201,
            json: () => Promise.resolve({
                key: 1,
                fact: "This is a test fact",
                views: 0,
                likes: 0
            })
        }));

        const fact = await search(true, 1);

        expect(fact).toEqual({
            key: 1,
            fact: "This is a test fact",
            views: 0,
            likes: 0
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    }); 

    test('for nonexisting fact', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 204,
            json: () => Promise.resolve(null)
        }));

        const factKey = await search(true, 1);

        expect(factKey).toBe(1);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('handles exception with null', async () => {
        global.fetch = jest.fn(() => Promise.reject("API bad"));

        const fact = await search(true, 1);

        expect(fact).toBe(null);
        expect(fetch).toHaveBeenCalledWith('/api/v1/facts?key=1');
    });
});

describe('factSpace', () => {
    const originalFetch = global.fetch;

    const TEST_FACT = {
        _id: 12345,
        key: 0,
        fact: "Test fact",
        views: 20,
        likes: 14
    };

    afterEach(() => {
        factSpace.resetVars();
        global.fetch = originalFetch;
    });

    test('updates id and key when showing an existing fact', () => {
        factSpace.showExistingFact(TEST_FACT, true);

        expect(factSpace.getId()).toBe(12345);
        expect(factSpace.getKey()).toBe(0);
    });

    test('updates key and NOT id when showing a new fact', () => {
        factSpace.showNewFact(0, true);

        expect(factSpace.getId()).toBe(null);
        expect(factSpace.getKey()).toBe(0);
    });

    test('resets id and key after given and updating a fact', async () => {
        global.fetch = jest.fn(() => Promise.resolve([]));

        factSpace.showExistingFact(TEST_FACT, true);
        await factSpace.update(true, true);

        expect(factSpace.getId()).toBe(null);
        expect(factSpace.getKey()).toBe(null);
    });

    test('updating error handles exception with null, still resets id and key', async () => {
        global.fetch = jest.fn(() => Promise.reject("API bad"));

        factSpace.showExistingFact(TEST_FACT, true);
        const res = await factSpace.update(true, true);

        expect(res).toBe(null);
        expect(factSpace.getId()).toBe(null);
        expect(factSpace.getKey()).toBe(null);
        expect(fetch).toHaveBeenCalledWith('/update?liked=true&id=12345', {"method": "POST"});
    });

    test('updating with 404 response returns null and does not reset id and key', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 404
        }));

        factSpace.showExistingFact(TEST_FACT, true);
        const res = await factSpace.update(true, true);

        expect(res).toBe(null);
        expect(factSpace.getId()).toEqual(12345);
        expect(factSpace.getKey()).toEqual(0);
    });

    test('updating with no current id returns null', async () => {
        const res = await factSpace.update(true, true);

        expect(res).toBe(null);
        expect(factSpace.getId()).toBe(null);
        expect(factSpace.getKey()).toBe(null);
    });

    test('resets key after adding new fact', async () => {
        global.fetch = jest.fn(() => Promise.resolve([]));

        factSpace.showNewFact(1, true);
        await factSpace.addFact(true);

        expect(factSpace.getKey()).toBe(null);
    });

    test('adding new fact handles exception with null, still resets key', async () => {
        global.fetch = jest.fn(() => Promise.reject("API bad"));

        factSpace.showNewFact(1, true);
        const res = await factSpace.addFact(true);

        expect(res).toBe(null);
        expect(factSpace.getKey()).toBe(null);
        expect(fetch).toHaveBeenCalledWith('/create?key=1', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fact: "test fact body" })
        });
    });

    test('adding fact with 400 response returns null and does not reset key', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 400
        }));

        factSpace.showNewFact(1, true);
        const res = await factSpace.addFact(true);

        expect(res).toBe(null);
        expect(factSpace.getKey()).toBe(1);
    })
});