const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    fichas: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

