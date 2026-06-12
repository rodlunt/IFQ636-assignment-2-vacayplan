// DESIGN PATTERN - CHAIN OF RESPONSIBILITY - The admin request pipeline is an
// explicit chain of handler links: protect (authentication) -> adminProtect
// (authorisation) -> validate (request shape) -> controller (business logic).
// Every link follows the same contract: it either HANDLES the request by
// terminating with a response, or PASSES it to the next link via next().
// validate() below builds the third link from a list of rules, so each route
// declares its own validation without the controller carrying the checks.

// A rule inspects the request and returns an error message when the request
// fails, or null to let it through to the next link.
const requireUserFields = (req) => {
    const { name, email, password } = req.body;
    return !name || !email || !password
        ? 'Name, email, and password are required'
        : null;
};

const requireValidStatus = (req) => {
    const { status } = req.body;
    return status !== 'deactivated' && status !== 'active'
        ? "status must be 'active' or 'deactivated'"
        : null;
};

// Builds the validate link for a route: runs each rule in order, terminates
// the chain with 400 on the first failure, passes to the next link otherwise.
const validate = (rules) => (req, res, next) => {
    for (const rule of rules) {
        const message = rule(req);
        if (message) {
            return res.status(400).json({ message });
        }
    }
    next();
};

module.exports = { validate, requireUserFields, requireValidStatus };
