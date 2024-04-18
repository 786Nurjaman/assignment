const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const TicketModel = require('../models/ticket.model')

const readCSV = async () => {
    const results = [];
    const stream = fs.createReadStream(path.resolve(__dirname, 'ticketsTest.csv'));
    await new Promise((resolve, reject) => {
        stream.pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    return results;
};
const getCsvData = async (req, res) => {
    try {
        const data = await readCSV();
        const uniqueValues = new Set();
        data.forEach(obj => {
        Object.values(obj).forEach(val => {
            if (val) uniqueValues.add(val);
        });
        });

    const sortedUniqueValues = Array.from(uniqueValues).sort();
    const valueIndices = {};
    sortedUniqueValues.forEach((val, index) => {
    valueIndices[val] = index;
    });

    const transformedArray = [];
    data.forEach(obj => {
        Object.values(obj).forEach(val => {
            if (val) {
            transformedArray.push(val.slice(0, 2) + valueIndices[val].toString().padStart(5, '0'));
            }
        });
    });

    const customSort = (a, b) => {
        const [prefixA, numberA] = [a.slice(0, 2), parseInt(a.slice(2))];
        const [prefixB, numberB] = [b.slice(0, 2), parseInt(b.slice(2))];
    
        if (prefixA < prefixB) return -1;
        if (prefixA > prefixB) return 1;
        return numberA - numberB;
    };

    transformedArray.sort(customSort);
    const ticketData = transformedArray.map(value => ({ ticket_no: value, code: uuidv4() }))
   

    const chunkSize = 20000

    for (let i = 0; i < ticketData.length; i += chunkSize) {
        const chunk = ticketData.slice(i, i + chunkSize);
        const operations = chunk.map(doc => ({
            insertOne: { document: doc }
        }));
        await TicketModel.bulkWrite(operations);
        console.log(`Inserted ${chunk.length} documents.`);
    }


    console.log(ticketData.length)
    return res.status(200).json({
            success: true,
            data: `${ticketData.length} data inserted successfully`
    })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message});
    }
}


const tickets = async(req, res)=>{
    const { start, end, page = 1, limit = 50 } = req.query;

if (!start || !end) {
    return res.status(400).json({ error: 'Both start and end parameters are required.' });
}

try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, totalTicketsCount] = await Promise.all([
        TicketModel.find({ ticket_no: { $gte: start, $lte: end } })
            .skip(skip)
            .limit(parseInt(limit)),
        TicketModel.countDocuments({ ticket_no: { $gte: start, $lte: end } })
    ]);

    const totalPages = Math.ceil(totalTicketsCount / parseInt(limit));
    const currentPage = parseInt(page);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const previousPage = currentPage > 1 ? currentPage - 1 : null;

    return res.status(200).json({
        success: true,
        data: tickets,
        count: tickets.length,
        totalPages,
        currentPage,
        nextPage,
        previousPage
    });
} catch (error) {
    return res.status(500).json({ success: false, error: 'An error occurred while fetching tickets.' });
}}

module.exports = {
    getCsvData,
    tickets
}