export class ErrorService {
  defaultHandler (err, req, res, next) {
    if (err) return res.status(400).send({ errorMessage: err.toString() });
    next(err);
  }
}
