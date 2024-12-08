import { Link } from 'react-router-dom';
import { ProjectLinkProps } from '../types/project';

const ProjectLink = ({ projectId, projectName, className = '' }: ProjectLinkProps) => {
  return (
    <Link
      to={`/projects/${projectId}`}
      className={`text-blue-600 hover:underline ${className}`}
    >
      #{projectName}
    </Link>
  );
};

export default ProjectLink;