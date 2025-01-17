const { createEvent } = require('@posthog/plugin-scaffold/test/utils.js')
const { processEvent } = require('../index')

const nestedEventProperties = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: 'nested under e'
                    },
                    z: 'nested under d'
                },
                z: 'nested under c'
            },
            z: 'nested under b'
        },
        z: 'nested under a'
    },
    w: {
        array: [{ z: 'nested in w array' }]
    },
    x: 'not nested',
    y: 'not nested either',
    event_properties: '{"Name":"LevelName","Duration":"20"}'
}

const nestedEventProperties2 = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: 'nested under e'
                    },
                    z: 'nested under d'
                },
                z: 'nested under c'
            },
            z: 'nested under b'
        },
        z: 'nested under a'
    },
    w: {
        array: [{ z: 'nested in w array' }]
    },
    x: 'not nested',
    y: 'not nested either'
}

const nestedEventProperties3 = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: 'nested under e'
                    },
                    z: 'nested under d'
                },
                z: 'nested under c'
            },
            z: 'nested under b'
        },
        z: 'nested under a'
    },
    w: {
        array: [{ z: 'nested in w array' }]
    },
    x: 'not nested',
    y: 'not nested either',
    event_properties: {
        Name: 'LevelName',
        Duration: '20'
    }
}

test('flattens all nested properties', async () => {
    const event = createEvent({ event: 'test', properties: nestedEventProperties })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        a: nestedEventProperties.a,
        w: nestedEventProperties.w,
        x: 'not nested',
        y: 'not nested either',
        event_properties: nestedEventProperties.event_properties,
        a__b__c__d__e__f: 'nested under e',
        a__b__c__d__z: 'nested under d',
        a__b__c__z: 'nested under c',
        a__b__z: 'nested under b',
        a__z: 'nested under a',
        w__array__0__z: 'nested in w array',
        event_properties__Name: 'LevelName',
        event_properties__Duration: '20'
    }

    expect(eventsOutput).toEqual(createEvent({ event: 'test', properties: expectedProperties }))
})

test('flattens all nested properties negetive', async () => {
    const event = createEvent({ event: 'test', properties: nestedEventProperties2 })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        a: nestedEventProperties2.a,
        w: nestedEventProperties2.w,
        x: 'not nested',
        y: 'not nested either',
        a__b__c__d__e__f: 'nested under e',
        a__b__c__d__z: 'nested under d',
        a__b__c__z: 'nested under c',
        a__b__z: 'nested under b',
        a__z: 'nested under a',
        w__array__0__z: 'nested in w array'
    }

    expect(eventsOutput).toEqual(createEvent({ event: 'test', properties: expectedProperties }))
})

test('test autocapture', async () => {
    const event = createEvent({
        event: '$autocapture',
        properties: {
            $elements: [
                { tag_name: 'span', nth_child: 1 },
                { tag_name: 'div', nth_child: 1 }
            ]
        }
    })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        $elements: [
            { tag_name: 'span', nth_child: 1 },
            { tag_name: 'div', nth_child: 1 }
        ]
    }

    expect(eventsOutput).toEqual(createEvent({ event: '$autocapture', properties: expectedProperties }))
})

test('test set and set once', async () => {
    const event = createEvent({
        event: '$identify',
        properties: {
            $set: {
                example: {
                    company_size: 20,
                    category: ['a', 'b']
                }
            },
            $set_once: {
                example: {
                    company_size: 20,
                    category: ['a', 'b']
                }
            }
        }
    })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        $set: {
            example: {
                company_size: 20,
                category: ['a', 'b']
            },
            example__company_size: 20,
            example__category__0: 'a',
            example__category__1: 'b'
        },
        $set_once: {
            example: {
                company_size: 20,
                category: ['a', 'b']
            },
            example__company_size: 20,
            example__category__0: 'a',
            example__category__1: 'b'
        }
    }

    expect(eventsOutput.properties).toEqual(expectedProperties)
})

test('flattens all event properties (Negetive)', async () => {
    const event = createEvent({ event: 'test', properties: nestedEventProperties3 })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        a: nestedEventProperties.a,
        w: nestedEventProperties.w,
        x: 'not nested',
        y: 'not nested either',
        event_properties: nestedEventProperties.event_properties,
        a__b__c__d__e__f: 'nested under e',
        a__b__c__d__z: 'nested under d',
        a__b__c__z: 'nested under c',
        a__b__z: 'nested under b',
        a__z: 'nested under a',
        w__array__0__z: 'nested in w array',
        event_properties__Name: 'LevelName',
        event_properties__Duration: '20'
    }
    expect(eventsOutput).toEqual(createEvent({ event: 'test', properties: expectedProperties }))
})

const nestedEventProperties4 = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: 'nested under e'
                    },
                    z: 'nested under d'
                },
                z: 'nested under c'
            },
            z: 'nested under b'
        },
        z: 'nested under a'
    },
    w: {
        array: [{ z: 'nested in w array' }]
    },
    x: 'not nested',
    y: 'not nested either',
    event_properties: {
        attributionDetails: '{"a" : "b", "c" : { "d" : "e"}}'
    }
}

test('flattens all event properties attribution', async () => {
    const event = createEvent({ event: 'test', properties: nestedEventProperties4 })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    const expectedProperties = {
        a: nestedEventProperties.a,
        w: nestedEventProperties.w,
        x: 'not nested',
        y: 'not nested either',
        event_properties: nestedEventProperties.event_properties,
        a__b__c__d__e__f: 'nested under e',
        a__b__c__d__z: 'nested under d',
        a__b__c__z: 'nested under c',
        a__b__z: 'nested under b',
        a__z: 'nested under a',
        w__array__0__z: 'nested in w array',
        event_properties__Name: 'LevelName',
        event_properties__Duration: '20',
        event_properties__a: 'b',
        event_properties__c__d: 'e'
    }

    // console.log(eventsOutput)
    expect(eventsOutput).toEqual(createEvent({ event: 'test', properties: expectedProperties }))
})

const nestedEventProperties5 = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: 'nested under e'
                    },
                    z: 'nested under d'
                },
                z: 'nested under c'
            },
            z: 'nested under b'
        },
        z: 'nested under a'
    },
    w: {
        array: [{ z: 'nested in w array' }]
    },
    x: 'not nested',
    y: 'not nested either',
    $set: {
        attributes: {
            orgId: 1234567890,
            campaignId: 1234567890,
            conversionType: 'Download',
            adGroupId: 1234567890,
            countryOrRegion: 'US',
            keywordId: 12323222,
            creativeSetId: 1234567890,
            attribution: true
        },
        attributes_created_date: '2022-01-18 08:46:38.0',
        attributes_updated_date: '2022-01-18 08:46:38.0',
        attributes_app_code: 'mm1'
    }
}

test('flattens all event properties attribution 2', async () => {
    const event = createEvent({ event: 'Attribution Identify', properties: nestedEventProperties5 })

    const eventsOutput = await processEvent(event, { config: { separator: '__' } })

    console.log(eventsOutput)
    // expect(eventsOutput).toEqual(createEvent({ event: 'Attribution Notification', properties: expectedProperties }))
})
